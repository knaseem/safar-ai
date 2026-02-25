import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET: List collaborators for a trip
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tripId } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify user owns or is collaborator on this trip
        const { data: trip } = await supabase
            .from("saved_trips")
            .select("user_id")
            .eq("id", tripId)
            .single()

        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 })
        }

        const isOwner = trip.user_id === user.id

        // Check if user is a collaborator
        if (!isOwner) {
            const { data: collab } = await supabase
                .from("trip_collaborators")
                .select("id")
                .eq("trip_id", tripId)
                .eq("user_id", user.id)
                .single()

            if (!collab) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 })
            }
        }

        const { data: collaborators, error } = await supabase
            .from("trip_collaborators")
            .select("id, email, role, accepted, created_at, user_id")
            .eq("trip_id", tripId)
            .order("created_at", { ascending: true })

        if (error) throw error

        return NextResponse.json({
            collaborators: collaborators || [],
            isOwner
        })
    } catch (error: any) {
        console.error("Collaborators fetch error:", error)
        return NextResponse.json(
            { error: "Failed to fetch collaborators" },
            { status: 500 }
        )
    }
}

// POST: Invite a collaborator
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tripId } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify ownership
        const { data: trip } = await supabase
            .from("saved_trips")
            .select("user_id")
            .eq("id", tripId)
            .eq("user_id", user.id)
            .single()

        if (!trip) {
            return NextResponse.json(
                { error: "Trip not found or not owned by you" },
                { status: 404 }
            )
        }

        const { email, role = "viewer" } = await req.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        if (!["editor", "viewer"].includes(role)) {
            return NextResponse.json({ error: "Role must be 'editor' or 'viewer'" }, { status: 400 })
        }

        // Check for duplicate
        const { data: existing } = await supabase
            .from("trip_collaborators")
            .select("id")
            .eq("trip_id", tripId)
            .eq("email", email)
            .single()

        if (existing) {
            return NextResponse.json(
                { error: "This person is already invited" },
                { status: 409 }
            )
        }

        // Create collaborator record
        const { data: collaborator, error } = await supabase
            .from("trip_collaborators")
            .insert({
                trip_id: tripId,
                email,
                role,
                invited_by: user.id,
                accepted: false
            })
            .select("id, invite_token, email, role")
            .single()

        if (error) throw error

        // Generate invite link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://safarai.app"
        const inviteLink = `${baseUrl}/collaborate/${tripId}?token=${collaborator.invite_token}`

        return NextResponse.json({
            collaborator,
            inviteLink,
            message: `Invite link created for ${email}`
        })
    } catch (error: any) {
        console.error("Invite error:", error)
        return NextResponse.json(
            { error: "Failed to invite collaborator" },
            { status: 500 }
        )
    }
}

// DELETE: Remove a collaborator
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: tripId } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { collaboratorId } = await req.json()

        if (!collaboratorId) {
            return NextResponse.json({ error: "collaboratorId required" }, { status: 400 })
        }

        // Only trip owner can remove collaborators
        const { data: trip } = await supabase
            .from("saved_trips")
            .select("user_id")
            .eq("id", tripId)
            .eq("user_id", user.id)
            .single()

        if (!trip) {
            return NextResponse.json({ error: "Not authorized" }, { status: 403 })
        }

        const { error } = await supabase
            .from("trip_collaborators")
            .delete()
            .eq("id", collaboratorId)
            .eq("trip_id", tripId)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Remove collaborator error:", error)
        return NextResponse.json(
            { error: "Failed to remove collaborator" },
            { status: 500 }
        )
    }
}

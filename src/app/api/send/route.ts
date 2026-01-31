import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        const data = await resend.emails.send({
            from: 'SafarAI Contact <onboarding@resend.dev>', // Default testing sender
            to: [process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'knaseem@safar-ai.co'],
            subject: `Contact Form: ${subject || 'New Message'}`,
            replyTo: email, // So you can reply directly to the user
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <hr />
                    <h3>Message:</h3>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `,
        });

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}

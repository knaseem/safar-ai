import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactRatelimit, isRateLimitEnabled, getRateLimitIdentifier } from '@/lib/ratelimit';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple HTML escape function to prevent XSS in emails
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export async function POST(req: Request) {
    try {
        // Rate limiting check (5 requests per minute for contact form)
        if (isRateLimitEnabled()) {
            const identifier = getRateLimitIdentifier(req);
            const { success, remaining } = await contactRatelimit.limit(identifier);

            if (!success) {
                return NextResponse.json(
                    { error: "Too many messages. Please wait a moment before trying again." },
                    {
                        status: 429,
                        headers: { 'X-RateLimit-Remaining': remaining.toString() }
                    }
                );
            }
        }

        const { name, email, subject, message } = await req.json();

        // Escape user input for HTML email
        const safeName = escapeHtml(name || '');
        const safeEmail = escapeHtml(email || '');
        const safeSubject = escapeHtml(subject || '');
        const safeMessage = escapeHtml(message || '');

        const data = await resend.emails.send({
            from: 'SafarAI Contact <support@safar-ai.co>', // Verified domain sender
            to: (process.env.ADMIN_EMAILS || 'knaseem@safar-ai.co').split(',').map(e => e.trim()),
            subject: `Contact Form: ${safeSubject || 'New Message'}`,
            // replyTo removed as requested
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>New SafarAI Contact</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #111111;">
                    <!-- Main Background Container with Travel Image -->
                    <div style="background-color: #000000; background-image: url('https://www.safar-ai.co/images/ai-hero/dubai-hero.png'); background-size: cover; background-position: center; padding: 60px 20px; min-height: 600px;">
                        
                        <!-- Floating Dark Card (Super Premium) -->
                        <div style="max-width: 600px; margin: 0 auto; background-color: rgba(0, 0, 0, 0.85); backdrop-filter: blur(12px); border: 1px solid #333333; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                            
                            <!-- Header with Logo -->
                            <div style="text-align: center; padding: 40px 0 30px; border-bottom: 1px solid #222222;">
                                <div style="display: inline-block; vertical-align: middle;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#ffffff" style="vertical-align: middle; display: inline-block;">
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                    </svg>
                                </div>
                                <h1 style="display: inline-block; vertical-align: middle; margin: 0 0 0 12px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; font-size: 26px; letter-spacing: -0.5px; font-weight: 700;">
                                    Safar<span style="color: #666666;">AI</span>
                                </h1>
                            </div>

                            <!-- Content -->
                            <div style="padding: 40px;">
                                <div style="text-align: center; margin-bottom: 40px;">
                                    <div style="display: inline-block; padding: 6px 16px; border: 1px solid #D4AF37; border-radius: 50px;">
                                        <p style="margin: 0; color: #D4AF37; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">New Priority Inquiry</p>
                                    </div>
                                </div>

                                <table style="width: 100%; border-collapse: separate; border-spacing: 0 15px;">
                                    <tr>
                                        <td style="width: 30%; color: #666666; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Sender</td>
                                        <td style="color: #ffffff; font-size: 16px; font-weight: 500;">${safeName}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666666; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">From Email</td>
                                        <td style="color: #ffffff; font-size: 16px;">
                                            <a href="mailto:${safeEmail}" style="color: #ffffff; text-decoration: none; border-bottom: 1px solid #333333;">${safeEmail}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666666; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Subject</td>
                                        <td style="color: #ffffff; font-size: 16px;">${safeSubject}</td>
                                    </tr>
                                </table>

                                <div style="margin-top: 35px; background-color: rgba(255,255,255,0.03); border: 1px solid #222222; border-radius: 8px; padding: 25px;">
                                    <p style="margin: 0; color: #e0e0e0; line-height: 1.8; font-size: 15px; white-space: pre-wrap;">${safeMessage}</p>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="background-color: #000000; padding: 25px; text-align: center; border-top: 1px solid #222222;">
                                <p style="margin: 0; color: #444444; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
                                    SafarAI // Secure Transmission
                                </p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error("Send email error:", error)
        return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
    }
}

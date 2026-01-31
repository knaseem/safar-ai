import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, subject, message } = await req.json();

        const data = await resend.emails.send({
            from: 'SafarAI Contact <support@safar-ai.co>', // Verified domain sender
            to: (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'knaseem@safar-ai.co').split(',').map(e => e.trim()),
            subject: `Contact Form: ${subject || 'New Message'}`,
            // replyTo removed as requested
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>New SafarAI Contact</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
                    <!-- Main Background Container with Travel Image -->
                    <div style="background-color: #000000; background-image: url('https://www.safar-ai.co/images/ai-hero/dubai-hero.png'); background-size: cover; background-position: center; padding: 60px 20px; min-height: 600px;">
                        
                        <!-- Floating White Card -->
                        <div style="max-width: 600px; margin: 0 auto; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                            
                            <!-- Header with Logo -->
                            <div style="text-align: center; padding: 40px 0 20px; border-bottom: 1px solid #eeeeee;">
                                <div style="display: inline-block; vertical-align: middle;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#000000" style="vertical-align: middle; display: inline-block;">
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                    </svg>
                                </div>
                                <h1 style="display: inline-block; vertical-align: middle; margin: 0 0 0 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000000; font-size: 24px; letter-spacing: -0.5px; font-weight: 700;">
                                    Safar<span style="color: #666666;">AI</span>
                                </h1>
                            </div>

                            <!-- Content -->
                            <div style="padding: 40px;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <p style="margin: 0; color: #D4AF37; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">New Inquiry Received</p>
                                </div>

                                <table style="width: 100%; border-collapse: separate; border-spacing: 0 10px;">
                                    <tr>
                                        <td style="width: 30%; color: #888888; font-size: 13px; font-weight: 500; text-transform: uppercase;">From</td>
                                        <td style="color: #000000; font-size: 16px; font-weight: 500;">${name}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #888888; font-size: 13px; font-weight: 500; text-transform: uppercase;">Email</td>
                                        <td style="color: #000000; font-size: 16px;">
                                            <a href="mailto:${email}" style="color: #000000; text-decoration: none; border-bottom: 1px solid #D4AF37;">${email}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #888888; font-size: 13px; font-weight: 500; text-transform: uppercase;">Subject</td>
                                        <td style="color: #000000; font-size: 16px;">${subject}</td>
                                    </tr>
                                </table>

                                <div style="margin-top: 30px; background-color: #f8f8f8; border-radius: 8px; padding: 25px;">
                                    <p style="margin: 0; color: #333333; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${message}</p>
                                </div>

                                <!-- Call to Action -->
                                <div style="margin-top: 40px; text-align: center;">
                                    <a href="mailto:${email}" style="background-color: #000000; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; display: inline-block; transition: all 0.3s ease;">
                                        Reply to Message
                                    </a>
                                </div>
                            </div>

                            <!-- Footer -->
                            <div style="background-color: #fcfcfc; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                                <p style="margin: 0; color: #cccccc; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">
                                    Sent via SafarAI Platform
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
        return NextResponse.json({ error }, { status: 500 });
    }
}

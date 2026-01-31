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
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #000000; padding: 20px 40px; border-bottom: 2px solid #D4AF37;">
                            <tr>
                                <td width="50" style="vertical-align: middle;">
                                    <div style="background-color: #ffffff; width: 32px; height: 32px; border-radius: 6px; text-align: center; display: block;">
                                        <!-- Plane Icon SVG forced to black with explicit path stroke -->
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 6px; display: inline-block; color: #000000;">
                                            <path stroke="#000000" d="M2 12h20M13 2l9 10-9 10M2 12l5-5m0 10l-5-5"/>
                                        </svg>
                                    </div>
                                </td>
                                <td style="vertical-align: middle;">
                                    <h1 style="margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff; font-size: 24px; letter-spacing: -0.5px; font-weight: 700;">
                                        Safar<span style="color: #a3a3a3;">AI</span>
                                    </h1>
                                </td>
                            </tr>
                        </table>

                        <!-- Content -->
                        <div style="padding: 40px;">
                            <div style="background-color: #f8f9fa; border-left: 4px solid #000000; padding: 15px; margin-bottom: 30px;">
                                <p style="margin: 0; color: #555555; font-size: 12px; font-weight: 600; text-transform: uppercase;">Status</p>
                                <p style="margin: 5px 0 0; color: #000000; font-size: 16px; font-weight: bold;">New Inquiry Received</p>
                            </div>

                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; width: 30%; color: #888888; font-size: 12px; font-weight: 600; text-transform: uppercase;">Sender</td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #000000; font-size: 16px;">${name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #888888; font-size: 12px; font-weight: 600; text-transform: uppercase;">From Email</td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #000000; font-size: 16px;">
                                        <a href="mailto:${email}" style="color: #000000; text-decoration: none;">${email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #888888; font-size: 12px; font-weight: 600; text-transform: uppercase;">Subject</td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #eeeeee; color: #000000; font-size: 16px;">${subject}</td>
                                </tr>
                            </table>

                            <div style="margin-top: 30px;">
                                <p style="margin: 0 0 10px; color: #888888; font-size: 12px; font-weight: 600; text-transform: uppercase;">Message Content</p>
                                <div style="background-color: #fcfcfc; border: 1px solid #eeeeee; border-radius: 4px; padding: 20px; color: #333333; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${message}</div>
                            </div>

                            <!-- Call to Action -->
                            <div style="margin-top: 40px; text-align: center;">
                                <a href="mailto:${email}" style="background-color: #000000; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; display: inline-block;">Reply to Inquiry</a>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background-color: #f8f9fa; padding: 20px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0; color: #aaaaaa; font-size: 10px;">
                                SECURE TRANSMISSION // SAFAR-AI SYSTEMS<br>
                                © 2026 SafarAI. All rights reserved.
                            </p>
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

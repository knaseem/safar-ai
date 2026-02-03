import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailParams {
    to: string;
    subject: string;
    bookingReference: string;
    bookingType: 'flight' | 'stay';
    // Flight specific
    flightDetails?: {
        origin: string;
        destination: string;
        departureDate: string;
        airline: string;
        passengers: string[];
    };
    // Stay specific
    stayDetails?: {
        hotelName: string;
        address: string;
        checkInDate: string;
        checkOutDate: string;
        checkInTime: string;
        checkOutTime: string;
        roomType: string;
        guests: string[];
        keyCollectionInstructions?: string;
        accessCode?: string;
        hotelPhone?: string;
    };
    // Payment
    totalAmount: string;
    currency: string;
}

export async function sendBookingConfirmationEmail(params: BookingEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY not configured, skipping email');
        return { success: false, error: 'Email service not configured' };
    }

    const isStay = params.bookingType === 'stay';

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .reference-box { background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; margin-top: 20px; }
        .reference-box .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
        .reference-box .value { font-size: 24px; font-weight: bold; font-family: monospace; margin-top: 5px; }
        .content { padding: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 12px; text-transform: uppercase; color: #666; letter-spacing: 1px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .info-box { background: #f9fafb; border-radius: 12px; padding: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .info-row:last-child { margin-bottom: 0; }
        .info-label { color: #666; }
        .info-value { font-weight: 600; color: #111; }
        .key-collection { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin-top: 20px; }
        .key-collection .title { color: #b45309; font-weight: bold; font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .key-collection .instructions { color: #78350f; }
        .access-code { background: #fbbf24; color: #78350f; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center; }
        .access-code .label { font-size: 10px; text-transform: uppercase; }
        .access-code .code { font-size: 28px; font-weight: bold; font-family: monospace; margin-top: 5px; }
        .total { border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 20px; }
        .total .amount { font-size: 28px; font-weight: bold; color: #111; }
        .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #666; font-size: 12px; }
        .footer a { color: #10b981; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Booking Confirmed!</h1>
            <p>Your ${isStay ? 'hotel reservation' : 'flight booking'} is complete</p>
            <div class="reference-box">
                <div class="label">Confirmation Number</div>
                <div class="value">${params.bookingReference}</div>
            </div>
        </div>
        
        <div class="content">
            ${isStay && params.stayDetails ? `
            <!-- Hotel Details -->
            <div class="section">
                <div class="section-title">🏨 Accommodation</div>
                <div class="info-box">
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">${params.stayDetails.hotelName}</div>
                    <div style="color: #666;">${params.stayDetails.address}</div>
                    ${params.stayDetails.hotelPhone ? `<div style="color: #666; margin-top: 5px;">📞 ${params.stayDetails.hotelPhone}</div>` : ''}
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">📅 Dates</div>
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">Check-in</span>
                        <span class="info-value">${params.stayDetails.checkInDate} (after ${params.stayDetails.checkInTime})</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Check-out</span>
                        <span class="info-value">${params.stayDetails.checkOutDate} (before ${params.stayDetails.checkOutTime})</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">🛏️ Room Details</div>
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">Room Type</span>
                        <span class="info-value">${params.stayDetails.roomType}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Guests</span>
                        <span class="info-value">${params.stayDetails.guests.join(', ')}</span>
                    </div>
                </div>
            </div>
            
            ${params.stayDetails.keyCollectionInstructions ? `
            <div class="key-collection">
                <div class="title">🔑 Key Collection Instructions</div>
                <div class="instructions">${params.stayDetails.keyCollectionInstructions}</div>
                ${params.stayDetails.accessCode ? `
                <div class="access-code">
                    <div class="label">Access Code</div>
                    <div class="code">${params.stayDetails.accessCode}</div>
                </div>
                ` : ''}
            </div>
            ` : ''}
            ` : ''}
            
            ${!isStay && params.flightDetails ? `
            <!-- Flight Details -->
            <div class="section">
                <div class="section-title">✈️ Flight Details</div>
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">Route</span>
                        <span class="info-value">${params.flightDetails.origin} → ${params.flightDetails.destination}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date</span>
                        <span class="info-value">${params.flightDetails.departureDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Airline</span>
                        <span class="info-value">${params.flightDetails.airline}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Passengers</span>
                        <span class="info-value">${params.flightDetails.passengers.join(', ')}</span>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <!-- Payment -->
            <div class="total">
                <div class="section-title">💳 Payment</div>
                <div class="info-row">
                    <span class="info-label">Total Paid</span>
                    <span class="amount">${params.currency} ${params.totalAmount}</span>
                </div>
                <div style="color: #10b981; margin-top: 10px;">✓ Payment Complete</div>
            </div>
        </div>
        
        <div class="footer">
            <p>Thank you for booking with Safar AI</p>
            <p><a href="https://safar-ai.co">Visit our website</a> | <a href="mailto:support@safar-ai.co">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: 'Safar AI <bookings@safar-ai.co>',
            to: params.to,
            subject: params.subject,
            html: emailHtml,
        });

        if (error) {
            console.error('[Email] Send error:', error);
            return { success: false, error: error.message };
        }

        console.log('[Email] Sent successfully:', data?.id);
        return { success: true, emailId: data?.id };
    } catch (error: any) {
        console.error('[Email] Exception:', error);
        return { success: false, error: error.message };
    }
}

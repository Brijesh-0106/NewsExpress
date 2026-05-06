import emailjs from 'emailjs-com';

// Note: You need to create a free account at https://www.emailjs.com/
// Then replace these placeholders with your actual IDs
const SERVICE_ID = "service_a3rk1ym";
const TEMPLATE_ID = "template_3shbz28";
const PUBLIC_KEY = "BerIYcUUdRExUBbPA";

export const sendWelcomeEmail = async (userEmail, topHeadlines) => {
    // Responsive Headline Blocks for Mobile
    const headline_html = topHeadlines.slice(0, 5).map((h, i) => `
        <div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.05);">
            <div style="color: #4f46e5; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                Topic: ${h.source?.name || 'General'}
            </div>
            <div class="headline-text" style="color: #0f172a; font-size: 18px; font-weight: 700; line-height: 1.4; margin-bottom: 8px;">
                ${h.title}
            </div>
            <div style="color: #64748b; font-size: 14px; line-height: 1.5;">
                ${h.description ? (h.description.length > 100 ? h.description.substring(0, 100) + '...' : h.description) : 'Click to read full story...'}
            </div>
        </div>
    `).join('');

    console.log(`Sending Premium Email to: ${userEmail}`);

    const templateParams = {
        to_email: userEmail,
        user_email: userEmail,
        reply_to: userEmail,
        to_name: userEmail.split('@')[0],
        name: userEmail.split('@')[0],
        from_name: "NewsExpress Intelligence",
        headline_html: headline_html,
        site_url: "https://newsaunty.vercel.app",
        subject: "Your NewsExpress Morning Digest is here!",
    };

    try {
        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('Email sent successfully!', response.status, response.text);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        // Fallback for demo purposes if keys aren't set
        alert("Subscription successful! (Email simulation: A real email would be sent if EmailJS keys were provided in EmailService.js)");
        return false;
    }
};

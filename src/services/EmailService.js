import emailjs from 'emailjs-com';

// Note: You need to create a free account at https://www.emailjs.com/
// Then replace these placeholders with your actual IDs
const SERVICE_ID = "service_a3rk1ym";
const TEMPLATE_ID = "template_3shbz28";
const PUBLIC_KEY = "BerIYcUUdRExUBbPA";

export const sendWelcomeEmail = async (userEmail, topHeadlines) => {
    // Formatting headlines for the email
    const headlineList = topHeadlines.slice(0, 5).map((h, i) => `${i + 1}. ${h.title}`).join('\n');

    const templateParams = {
        name: userEmail.split('@')[0],
        time: new Date().toLocaleString(),
        to_email: userEmail,
        subject: "Welcome to NewsExpress Digest!",
        message: `You have successfully subscribed to NewsExpress Morning Digest.\n\nHere are your Top 5 Headlines for today:\n\n${headlineList}\n\nRead more at: ${window.location.origin}`,
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

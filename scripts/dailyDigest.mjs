import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import WebSocket from 'ws';

// We use environment variables that will be provided by GitHub Actions
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const newsApiKey = "9b8e226f60a74866aa4af26f6622f07a"; 
const emailjsServiceId = "service_v1v057d";
const emailjsTemplateId = "template_u19k93u";
const emailjsPublicKey = "BerIYcUUdRExUBbPA";
const emailjsPrivateKey = process.env.REACT_APP_EMAILJS_PRIVATE_KEY;

// Initialize Supabase with WebSocket support for Node.js
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: { websocket: WebSocket }
});

async function sendDailyDigest() {
    console.log("🚀 Starting Morning Digest Automation...");

    try {
        // 1. Fetch all subscribers from Supabase
        const { data: subscribers, error } = await supabase
            .from('subscribers')
            .select('email');

        if (error) throw error;
        if (!subscribers || subscribers.length === 0) {
            console.log("📭 No subscribers found. Exiting.");
            return;
        }

        console.log(`👥 Found ${subscribers.length} subscribers.`);

        // 2. Fetch latest Top Headlines
        const newsUrl = `https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${newsApiKey}`;
        const newsResponse = await fetch(newsUrl);
        const newsData = await newsResponse.json();
        const articles = newsData.articles || [];

        if (articles.length === 0) {
            console.log("📰 No new articles found. Exiting.");
            return;
        }

        // 3. Format the Headline HTML
        const headline_html = articles.map((h, i) => `
            <div style="margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid rgba(0,0,0,0.05);">
                <div style="color: #4f46e5; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                    Story #${i + 1}
                </div>
                <div style="color: #0f172a; font-size: 18px; font-weight: 700; line-height: 1.4; margin-bottom: 8px;">
                    ${h.title}
                </div>
                <div style="color: #64748b; font-size: 14px; line-height: 1.5;">
                    ${h.description || 'Visit NewsExpress for the full coverage.'}
                </div>
            </div>
        `).join('');

        // 4. Send email to each subscriber via EmailJS REST API
        for (const sub of subscribers) {
            console.log(`📧 Sending digest to ${sub.email}...`);
            
            const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: emailjsServiceId,
                    template_id: emailjsTemplateId,
                    user_id: emailjsPublicKey,
                    accessToken: emailjsPrivateKey,
                    template_params: {
                        to_email: sub.email,
                        name: sub.email.split('@')[0],
                        headline_html: headline_html,
                        site_url: "https://newsaunty.vercel.app",
                        subject: "Your NewsExpress Morning Digest is ready!"
                    }
                })
            });

            if (emailResponse.ok) {
                console.log(`✅ Successfully sent to ${sub.email}`);
            } else {
                const errText = await emailResponse.text();
                console.error(`❌ Failed for ${sub.email}:`, errText);
            }
        }

        console.log("✨ All digests processed!");

    } catch (err) {
        console.error("💥 Automation Error:", err);
    }
}

sendDailyDigest();

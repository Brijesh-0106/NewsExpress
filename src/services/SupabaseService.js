import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Saves a new subscriber to the Supabase database.
 * Table name: 'subscribers'
 * Columns: 'email' (text, unique), 'created_at' (timestamp)
 */
export const subscribeUser = async (email) => {
    if (!supabaseUrl || supabaseUrl === "your_supabase_project_url") {
        console.warn("Supabase not configured. Subscriber not saved.");
        return { success: true, message: "Simulation mode" };
    }

    try {
        const { data, error } = await supabase
            .from('subscribers')
            .upsert({ email: email }, { onConflict: 'email' });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error("Supabase Error:", error.message);
        return { success: false, error: error.message };
    }
};

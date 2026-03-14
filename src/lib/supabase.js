import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jpinlbhpnjrqvojatkds.supabase.co";
const supabaseKey = "sb_publishable_n_fEUYO-rVfaVuEoXOh9hQ_GiPSxJHx";

export const supabase = createClient(supabaseUrl, supabaseKey);

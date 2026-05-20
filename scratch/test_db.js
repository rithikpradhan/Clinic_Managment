import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jpinlbhpnjrqvojatkds.supabase.co";
const supabaseKey = "sb_publishable_n_fEUYO-rVfaVuEoXOh9hQ_GiPSxJHx";
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: settings, error: e1 } = await supabase.from('clinic_settings').select('*');
  console.log('Clinic Settings:', settings, e1);

  const { data: treatments, error: e2 } = await supabase.from('treatments').select('*').limit(3);
  console.log('Treatments sample:', treatments, e2);
}
check();

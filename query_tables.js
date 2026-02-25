require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log("users:", error ? error.message : "Exists");
  
  const { data: d2, error: e2 } = await supabase.from('subscriptions').select('*').limit(1);
  console.log("subscriptions:", e2 ? e2.message : "Exists");
}
check();

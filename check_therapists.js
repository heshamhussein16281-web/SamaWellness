const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  const { data: therapists, error } = await supabase
    .from('therapists')
    .select('id, name, rate')
    .limit(10);

  if (error) {
    console.log('Error:', error);
    return;
  }

  if (!therapists || therapists.length === 0) {
    console.log('No therapists found');
    return;
  }

  console.log('Available therapists:');
  therapists.forEach(t => {
    console.log(`  ID ${t.id}: ${t.name} (${t.rate} EGP)`);
  });
})();

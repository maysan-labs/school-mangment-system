import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const email = 'vncgzb@gmail.com';
  const password = 'vncgzb@123';
  
  console.log(`Checking for admin user: ${email}`);
  
  // Try to list users first to see if they exist
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  let user = listData.users.find(u => u.email === email);

  if (!user) {
    console.log('User not found. Creating new user...');
    const { data: newData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    user = newData.user;
    console.log(`User created with ID: ${user.id}`);
  } else {
    console.log(`User already exists with ID: ${user.id}. Updating password...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password });
    if (updateError) {
      console.error('Error updating password:', updateError);
    }
  }

  console.log('Updating profile...');
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: email,
      first_name: 'System',
      last_name: 'Admin',
      role: 'admin'
    });

  if (profileError) {
    console.error('Error upserting profile:', profileError);
  } else {
    console.log('Admin profile provisioned successfully!');
  }
}

createAdmin();

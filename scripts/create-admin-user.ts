import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdminUser() {
  try {
    // Get the admin role
    const { data: roles, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin');

    if (roleError || !roles || roles.length === 0) {
      console.error('Error fetching admin role:', roleError);
      return;
    }

    const adminRole = roles[0];

    // Hash password
    const password = process.env.ADMIN_PASSWORD || 'Sama202#';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create admin user
    const { data: user, error: userError } = await supabase
      .from('clinic_users')
      .insert([
        {
          username: 'admin',
          email: 'admin@samawellness.com',
          password_hash: passwordHash,
          role_id: adminRole.id,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (userError) {
      if (userError.code === '23505') {
        console.log('Admin user already exists');
        return;
      }
      console.error('Error creating admin user:', userError);
      return;
    }

    console.log('Admin user created successfully:', {
      username: user.username,
      email: user.email,
      password: 'Use the ADMIN_PASSWORD env var or default: Sama202#',
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();

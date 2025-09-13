# Database Setup Instructions

## To fix the "Database error saving new user" issue:

### 1. Run the SQL Schema
You need to execute the `supabase-schema.sql` file in your Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

### 2. Key Changes Made:

1. **Fixed Users Table Structure**: 
   - Changed `id uuid PRIMARY KEY DEFAULT uuid_generate_v4()` to `id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY`
   - This ensures the users table uses the same ID as Supabase Auth users

2. **Added Auto User Creation Trigger**:
   - Added `handle_new_user()` function that automatically creates a user profile when someone signs up
   - Added trigger `on_auth_user_created` that runs after each auth user creation

3. **Added Insert Policy**:
   - Added policy to allow initial user profile creation during signup

### 3. Test the Fix:
After running the schema, try signing up again. The database should now automatically create a user profile when someone signs up through Supabase Auth.

### 4. If Still Having Issues:
- Check Supabase logs in the dashboard
- Verify that RLS policies are not blocking the user creation
- Make sure the trigger was created successfully in the database

## The Root Cause:
The error occurred because:
1. Supabase Auth creates users in `auth.users` table
2. Our app expects user data in `public.users` table  
3. There was no automatic connection between these two
4. The trigger now automatically creates the public.users record when auth.users record is created
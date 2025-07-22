# Supabase Setup Guide

This guide will help you set up Supabase for your AI Learning Tracker application.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project" 
3. Choose your organization
4. Fill in project details:
   - **Name**: `ai-learning-tracker`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait for the project to be set up (usually 2-3 minutes)

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Project API Keys** → **anon/public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Configure Environment Variables

1. Open your `.env.local` file in the project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- ✅ User profiles table
- ✅ Resources table with categories and ratings
- ✅ User progress tracking
- ✅ Resource ratings system
- ✅ Row Level Security (RLS) policies
- ✅ Database functions and triggers
- ✅ Sample data

## Step 5: Enable Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure your authentication settings:
   - **Site URL**: `http://localhost:8000` (for development)
   - **Redirect URLs**: `http://localhost:8000/**`

## Step 6: Test the Setup

1. Restart your development server: `npm run dev`
2. The application should now connect to Supabase
3. Check the browser console for any connection errors

## Next Steps

Once Supabase is set up, you can:
- Add user authentication pages
- Replace static data with real database queries  
- Implement user profiles and settings
- Add real-time features

## Troubleshooting

### Common Issues:

**"Missing Supabase environment variables"**
- Check that your `.env.local` file has the correct variable names
- Restart your development server after changing environment variables

**"Invalid API key"** 
- Double-check you copied the **anon/public** key, not the service role key
- Make sure there are no extra spaces in your environment variables

**Database connection errors**
- Verify your project URL is correct
- Check that you ran the schema SQL successfully

### Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community Discord](https://discord.supabase.com)
- Check the browser console for detailed error messages
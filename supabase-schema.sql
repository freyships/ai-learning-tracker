-- AI Learning Tracker Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE resource_category AS ENUM (
  'tutorial',
  'documentation', 
  'video',
  'course',
  'tool',
  'book',
  'article',
  'podcast',
  'community'
);

CREATE TYPE difficulty_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced'
);

CREATE TYPE progress_status AS ENUM (
  'not_started',
  'in_progress',
  'completed'
);

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  learning_goals TEXT[],
  bio TEXT,
  github_username TEXT,
  website_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Resources table
CREATE TABLE public.resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  category resource_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  difficulty difficulty_level NOT NULL,
  added_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  rating_sum INTEGER DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Progress table
CREATE TABLE public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  status progress_status DEFAULT 'not_started' NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent_minutes INTEGER DEFAULT 0,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, resource_id)
);

-- Resource ratings table
CREATE TABLE public.resource_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, resource_id)
);

-- Indexes for better performance
CREATE INDEX idx_resources_category ON public.resources(category);
CREATE INDEX idx_resources_difficulty ON public.resources(difficulty);
CREATE INDEX idx_resources_public ON public.resources(is_public);
CREATE INDEX idx_resources_added_by ON public.resources(added_by);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_status ON public.user_progress(status);
CREATE INDEX idx_resource_ratings_resource_id ON public.resource_ratings(resource_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for resources
CREATE POLICY "Public resources are viewable by everyone" ON public.resources
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own resources" ON public.resources
  FOR SELECT USING (auth.uid() = added_by);

CREATE POLICY "Authenticated users can insert resources" ON public.resources
  FOR INSERT WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can update own resources" ON public.resources
  FOR UPDATE USING (auth.uid() = added_by);

CREATE POLICY "Users can delete own resources" ON public.resources
  FOR DELETE USING (auth.uid() = added_by);

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON public.user_progress
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for resource_ratings
CREATE POLICY "All ratings are viewable by everyone" ON public.resource_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON public.resource_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON public.resource_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON public.resource_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update resource rating statistics
CREATE OR REPLACE FUNCTION update_resource_rating_stats()
RETURNS trigger AS $$
BEGIN
  -- Update the resource rating statistics
  UPDATE public.resources
  SET 
    rating_sum = (
      SELECT COALESCE(SUM(rating), 0)
      FROM public.resource_ratings
      WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.resource_ratings
      WHERE resource_id = COALESCE(NEW.resource_id, OLD.resource_id)
    )
  WHERE id = COALESCE(NEW.resource_id, OLD.resource_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update rating stats when ratings change
CREATE OR REPLACE TRIGGER on_rating_insert
  AFTER INSERT ON public.resource_ratings
  FOR EACH ROW EXECUTE FUNCTION update_resource_rating_stats();

CREATE OR REPLACE TRIGGER on_rating_update
  AFTER UPDATE ON public.resource_ratings
  FOR EACH ROW EXECUTE FUNCTION update_resource_rating_stats();

CREATE OR REPLACE TRIGGER on_rating_delete
  AFTER DELETE ON public.resource_ratings
  FOR EACH ROW EXECUTE FUNCTION update_resource_rating_stats();

-- Insert some sample data
INSERT INTO public.resources (title, description, url, category, tags, difficulty, added_by, is_public) VALUES
('Claude.ai Documentation', 'Official documentation for using Claude AI for coding assistance', 'https://docs.anthropic.com/claude', 'documentation', ARRAY['claude', 'ai', 'documentation'], 'beginner', (SELECT id FROM auth.users LIMIT 1), true),
('Cursor IDE Tutorial', 'Complete guide to using Cursor for AI-powered development', 'https://cursor.com/docs', 'tutorial', ARRAY['cursor', 'ide', 'ai-coding'], 'intermediate', (SELECT id FROM auth.users LIMIT 1), true),
('GitHub Copilot Best Practices', 'Tips and tricks for getting the most out of GitHub Copilot', 'https://docs.github.com/copilot', 'article', ARRAY['github-copilot', 'ai', 'productivity'], 'intermediate', (SELECT id FROM auth.users LIMIT 1), true);
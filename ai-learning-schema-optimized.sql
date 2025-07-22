-- AI Learning Tracker - Optimized Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE experience_level AS ENUM (
  'beginner',
  'intermediate', 
  'advanced',
  'expert'
);

CREATE TYPE difficulty_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced'
);

CREATE TYPE learning_type AS ENUM (
  'tutorial',
  'course',
  'documentation',
  'experiment',
  'workshop',
  'article',
  'video',
  'book',
  'podcast'
);

-- Profiles table with optimizations
CREATE TABLE public.profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL 
    CHECK (username ~ '^[a-z0-9_]{3,30}$'), -- lowercase, alphanumeric + underscore, 3-30 chars
  email TEXT UNIQUE NOT NULL
    CHECK (email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'), -- basic email validation
  display_name TEXT NOT NULL
    CHECK (char_length(display_name) BETWEEN 1 AND 100), -- more flexible than full_name
  avatar_url TEXT
    CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://'), -- validate URL format
  bio TEXT
    CHECK (char_length(bio) <= 500), -- prevent overly long bios
  experience_level experience_level DEFAULT 'beginner' NOT NULL,
  learning_goals TEXT[] DEFAULT '{}' 
    CHECK (array_length(learning_goals, 1) IS NULL OR array_length(learning_goals, 1) <= 10), -- max 10 goals
  ai_tools_used TEXT[] DEFAULT '{}',
  website_url TEXT
    CHECK (website_url IS NULL OR website_url ~ '^https?://'), -- validate URL format
  location TEXT
    CHECK (char_length(location) <= 100), -- added for community features
  timezone TEXT, -- useful for scheduling/community
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Learnings table with optimizations
CREATE TABLE public.learnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL
    CHECK (char_length(title) BETWEEN 3 AND 200), -- reasonable title length
  description TEXT NOT NULL
    CHECK (char_length(description) BETWEEN 10 AND 5000), -- substantial but not excessive
  source_platform TEXT NOT NULL
    CHECK (char_length(source_platform) <= 100), -- e.g., "YouTube", "Coursera", "Documentation"
  resource_title TEXT NOT NULL
    CHECK (char_length(resource_title) <= 300), -- specific resource name/title
  resource_url TEXT
    CHECK (resource_url IS NULL OR resource_url ~ '^https?://'), -- validate URL format
  learning_type learning_type DEFAULT 'tutorial' NOT NULL,
  tags TEXT[] DEFAULT '{}'
    CHECK (array_length(tags, 1) IS NULL OR array_length(tags, 1) <= 20), -- max 20 tags
  difficulty difficulty_level NOT NULL,
  time_spent_minutes INTEGER DEFAULT 0
    CHECK (time_spent_minutes >= 0 AND time_spent_minutes <= 1440), -- max 24 hours per session
  resource_rating INTEGER
    CHECK (resource_rating IS NULL OR (resource_rating >= 1 AND resource_rating <= 5)), -- 1-5 stars or null
  completion_date DATE, -- when they finished learning (separate from created_at)
  key_takeaways TEXT
    CHECK (char_length(key_takeaways) <= 1000), -- brief summary of insights
  would_recommend BOOLEAN DEFAULT NULL, -- explicit recommendation
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Performance indexes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_experience_level ON public.profiles(experience_level);
CREATE INDEX idx_profiles_is_public ON public.profiles(is_public);
CREATE INDEX idx_profiles_location ON public.profiles(location) WHERE location IS NOT NULL;

CREATE INDEX idx_learnings_user_id ON public.learnings(user_id);
CREATE INDEX idx_learnings_difficulty ON public.learnings(difficulty);
CREATE INDEX idx_learnings_learning_type ON public.learnings(learning_type);
CREATE INDEX idx_learnings_is_public ON public.learnings(is_public);
CREATE INDEX idx_learnings_completion_date ON public.learnings(completion_date) WHERE completion_date IS NOT NULL;
CREATE INDEX idx_learnings_resource_rating ON public.learnings(resource_rating) WHERE resource_rating IS NOT NULL;

-- GIN indexes for array fields (efficient for searching within arrays)
CREATE INDEX idx_profiles_learning_goals_gin ON public.profiles USING GIN(learning_goals);
CREATE INDEX idx_profiles_ai_tools_gin ON public.profiles USING GIN(ai_tools_used);
CREATE INDEX idx_learnings_tags_gin ON public.learnings USING GIN(tags);

-- Full-text search indexes for content discovery
CREATE INDEX idx_learnings_title_fts ON public.learnings USING GIN(to_tsvector('english', title));
CREATE INDEX idx_learnings_description_fts ON public.learnings USING GIN(to_tsvector('english', description));

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for learnings
CREATE POLICY "Public learnings are viewable by everyone" ON public.learnings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own learnings" ON public.learnings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learnings" ON public.learnings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learnings" ON public.learnings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learnings" ON public.learnings
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learnings_updated_at 
  BEFORE UPDATE ON public.learnings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to get user statistics
CREATE OR REPLACE FUNCTION get_user_learning_stats(user_uuid UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_learnings', COUNT(*),
      'total_time_spent', SUM(time_spent_minutes),
      'avg_rating_given', ROUND(AVG(resource_rating), 2),
      'difficulty_breakdown', json_build_object(
        'beginner', COUNT(*) FILTER (WHERE difficulty = 'beginner'),
        'intermediate', COUNT(*) FILTER (WHERE difficulty = 'intermediate'),
        'advanced', COUNT(*) FILTER (WHERE difficulty = 'advanced')
      ),
      'learning_types', json_agg(DISTINCT learning_type),
      'recent_activity', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')
    )
    FROM public.learnings
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data for testing
INSERT INTO public.profiles (user_id, username, email, display_name, bio, experience_level, learning_goals, ai_tools_used, website_url) 
VALUES
(
  '00000000-0000-0000-0000-000000000001'::UUID,
  'ai_learner_1',
  'learner1@example.com',
  'Alex Smith',
  'Passionate about AI and machine learning, always eager to learn new tools and techniques.',
  'intermediate',
  ARRAY['Master prompt engineering', 'Learn computer vision', 'Build AI applications'],
  ARRAY['Claude', 'ChatGPT', 'Cursor', 'GitHub Copilot'],
  'https://alexsmith.dev'
) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.learnings (user_id, title, description, source_platform, resource_title, learning_type, tags, difficulty, time_spent_minutes, resource_rating, completion_date, key_takeaways, would_recommend)
VALUES
(
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Advanced Prompt Engineering Techniques',
  'Learned about chain-of-thought prompting, few-shot learning, and prompt optimization strategies. Really helped me understand how to structure prompts for better AI responses.',
  'YouTube',
  'Prompt Engineering Masterclass by AI Explained',
  'tutorial',
  ARRAY['prompt-engineering', 'claude', 'chatgpt', 'ai-optimization'],
  'intermediate',
  120,
  5,
  CURRENT_DATE - INTERVAL '2 days',
  'Key insight: Breaking complex tasks into step-by-step instructions dramatically improves AI performance.',
  true
),
(
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Building with Cursor IDE',
  'Explored Cursor''s AI pair programming features. Learned how to effectively collaborate with AI for code generation and debugging.',
  'Cursor Documentation',
  'Cursor IDE Official Guide',
  'documentation',
  ARRAY['cursor', 'ide', 'pair-programming', 'code-generation'],
  'beginner',
  90,
  4,
  CURRENT_DATE - INTERVAL '5 days',
  'Cursor''s context awareness makes it much more effective than generic code completion tools.',
  true
);

-- Comments explaining field choices
COMMENT ON COLUMN public.learnings.source_platform IS 'Where they learned it (YouTube, Coursera, Documentation, etc.)';
COMMENT ON COLUMN public.learnings.resource_title IS 'Specific name/title of the resource used';
COMMENT ON COLUMN public.learnings.resource_url IS 'Direct link to the resource (optional)';
COMMENT ON COLUMN public.learnings.completion_date IS 'When they finished learning (different from when they posted)';
COMMENT ON COLUMN public.learnings.key_takeaways IS 'Brief summary of main insights gained';
COMMENT ON COLUMN public.learnings.would_recommend IS 'Whether they would recommend this resource to others';
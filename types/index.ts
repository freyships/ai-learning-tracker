// Database Types (matching Supabase schema)
export interface Profile {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  learning_goals?: string[];
  ai_tools_used?: string[];
  website_url?: string;
  location?: string;
  timezone?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  tags: string[];
  difficulty: DifficultyLevel;
  added_by: string;
  is_public: boolean;
  rating_sum: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  // Computed properties
  average_rating?: number;
  user_progress?: UserProgress;
}

export type ResourceCategory = 
  | 'tutorial'
  | 'documentation'
  | 'video'
  | 'course'
  | 'tool'
  | 'book'
  | 'article'
  | 'podcast'
  | 'community';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserProgress {
  id: string;
  user_id: string;
  resource_id: string;
  status: ProgressStatus;
  progress_percentage: number; // 0-100
  time_spent_minutes: number;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceRating {
  id: string;
  user_id: string;
  resource_id: string;
  rating: number; // 1-5
  review?: string;
  created_at: string;
  updated_at: string;
}

// Extended types with relationships
export interface ResourceWithProfile extends Resource {
  profiles: Pick<Profile, 'user_id' | 'full_name' | 'avatar_url'>;
}

export interface UserProgressWithResource extends UserProgress {
  resources: Resource;
}

// Legacy types for backward compatibility
export interface LearningProgress {
  resourceId: string;
  status: ProgressStatus;
  progress: number;
  notes?: string;
  timeSpent?: number;
  completedDate?: Date;
}

export interface Learner {
  id: string;
  name: string;
  email?: string;
  learningGoals: string[];
  progress: LearningProgress[];
  joinDate: Date;
}
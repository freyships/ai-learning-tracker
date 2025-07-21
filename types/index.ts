export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  addedBy: string;
  dateAdded: Date;
  rating?: number;
  notes?: string;
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

export interface LearningProgress {
  resourceId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number; // 0-100
  notes?: string;
  timeSpent?: number; // in minutes
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
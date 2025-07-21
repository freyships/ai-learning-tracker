'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Resource, LearningProgress } from '@/types';

const sampleResources: Resource[] = [
  {
    id: '1',
    title: 'Claude.ai Documentation',
    description: 'Official documentation for using Claude AI for coding assistance',
    url: 'https://docs.anthropic.com/claude',
    category: 'documentation',
    tags: ['claude', 'ai', 'documentation'],
    difficulty: 'beginner',
    addedBy: 'System',
    dateAdded: new Date('2024-01-15'),
    rating: 5,
  },
  {
    id: '2',
    title: 'Cursor IDE Tutorial',
    description: 'Complete guide to using Cursor for AI-powered development',
    url: 'https://cursor.com/docs',
    category: 'tutorial',
    tags: ['cursor', 'ide', 'ai-coding'],
    difficulty: 'intermediate',
    addedBy: 'System',
    dateAdded: new Date('2024-01-10'),
    rating: 4,
  },
  {
    id: '3',
    title: 'GitHub Copilot Best Practices',
    description: 'Tips and tricks for getting the most out of GitHub Copilot',
    url: 'https://docs.github.com/copilot',
    category: 'article',
    tags: ['github-copilot', 'ai', 'productivity'],
    difficulty: 'intermediate',
    addedBy: 'System',
    dateAdded: new Date('2024-01-05'),
    rating: 4,
  }
];

const sampleProgress: LearningProgress[] = [
  {
    resourceId: '1',
    status: 'completed',
    progress: 100,
    notes: 'Great introduction to Claude capabilities!',
    timeSpent: 120,
    completedDate: new Date('2024-01-16')
  },
  {
    resourceId: '2',
    status: 'in_progress',
    progress: 60,
    notes: 'Really enjoying the IDE features, halfway through the advanced sections',
    timeSpent: 180
  },
  {
    resourceId: '3',
    status: 'not_started',
    progress: 0
  }
];

function ProgressCard({ resource, progress, onUpdateProgress }: { 
  resource: Resource; 
  progress: LearningProgress;
  onUpdateProgress: (resourceId: string, newProgress: Partial<LearningProgress>) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: progress.status,
    progress: progress.progress,
    notes: progress.notes || ''
  });

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  const handleSave = () => {
    onUpdateProgress(resource.id, editData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {resource.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {resource.description}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[progress.status]}`}>
          {progress.status.replace('_', ' ')}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{progress.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress.progress}%` }}
          ></div>
        </div>
      </div>

      {progress.timeSpent && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Time spent: {Math.floor(progress.timeSpent / 60)}h {progress.timeSpent % 60}m
        </p>
      )}

      {progress.completedDate && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Completed: {progress.completedDate.toLocaleDateString()}
        </p>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select 
              value={editData.status}
              onChange={(e) => setEditData(prev => ({ 
                ...prev, 
                status: e.target.value as 'not_started' | 'in_progress' | 'completed',
                progress: e.target.value === 'completed' ? 100 : e.target.value === 'not_started' ? 0 : prev.progress
              }))}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          {editData.status === 'in_progress' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Progress (%)
              </label>
              <input 
                type="range"
                min="0"
                max="100"
                value={editData.progress}
                onChange={(e) => setEditData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">{editData.progress}%</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-2 py-1 text-sm"
              rows={3}
              placeholder="Add your thoughts, insights, or feedback..."
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {progress.notes && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">&ldquo;{progress.notes}&rdquo;</p>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <a 
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              View Resource →
            </a>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
            >
              Update Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyProgress() {
  const [progressData, setProgressData] = useState(sampleProgress);

  const updateProgress = (resourceId: string, newProgress: Partial<LearningProgress>) => {
    setProgressData(prev => 
      prev.map(p => 
        p.resourceId === resourceId 
          ? { ...p, ...newProgress, ...(newProgress.status === 'completed' ? { completedDate: new Date() } : {}) }
          : p
      )
    );
  };

  const progressStats = {
    completed: progressData.filter(p => p.status === 'completed').length,
    inProgress: progressData.filter(p => p.status === 'in_progress').length,
    notStarted: progressData.filter(p => p.status === 'not_started').length,
    totalTime: progressData.reduce((sum, p) => sum + (p.timeSpent || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to Resources
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            My Learning Progress
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your journey through AI coding resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">{progressStats.completed}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{progressStats.inProgress}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300">In Progress</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{progressStats.notStarted}</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">Not Started</div>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
              {Math.floor(progressStats.totalTime / 60)}h {progressStats.totalTime % 60}m
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Time Spent</div>
          </div>
        </div>

        <div className="space-y-6">
          {progressData.map((progress) => {
            const resource = sampleResources.find(r => r.id === progress.resourceId);
            if (!resource) return null;
            
            return (
              <ProgressCard 
                key={progress.resourceId}
                resource={resource} 
                progress={progress}
                onUpdateProgress={updateProgress}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
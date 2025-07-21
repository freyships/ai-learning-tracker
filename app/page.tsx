import Link from "next/link";
import { Resource } from "@/types";

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

function ResourceCard({ resource }: { resource: Resource }) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {resource.title}
        </h3>
        <span className={`px-2 py-1 text-xs rounded-full ${difficultyColors[resource.difficulty]}`}>
          {resource.difficulty}
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
        {resource.description}
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {resource.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {resource.category}
        </span>
        <a 
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
        >
          View Resource →
        </a>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            AI Learning Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Discover, track, and share resources for learning to code with AI
          </p>
          
          <div className="flex gap-4">
            <Link 
              href="/add-resource"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add Resource
            </Link>
            <Link 
              href="/my-progress"
              className="border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              My Progress
            </Link>
          </div>
        </header>

        <main>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Learning Resources
            </h2>
            <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2">
              <option value="all">All Categories</option>
              <option value="tutorial">Tutorials</option>
              <option value="documentation">Documentation</option>
              <option value="video">Videos</option>
              <option value="course">Courses</option>
              <option value="tool">Tools</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

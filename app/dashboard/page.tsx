'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function DashboardContent() {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome back, {profile?.full_name || user?.email}!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Ready to continue your AI learning journey?
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Profile Info */}
        {profile && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Your Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Username:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">@{profile.username}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">{profile.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Experience Level:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400 capitalize">{profile.experience_level}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Joined:</span>{' '}
                <span className="text-gray-600 dark:text-gray-400">
                  {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {profile.bio && (
              <div className="mt-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Bio:</span>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.bio}</p>
              </div>
            )}

            {profile.learning_goals && profile.learning_goals.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Learning Goals:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.learning_goals.map((goal, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.ai_tools_used && profile.ai_tools_used.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">AI Tools Used:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.ai_tools_used.map((tool, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/profile/edit"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Edit Profile
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Update your learning goals, bio, and experience level
            </p>
          </Link>

          <Link
            href="/learnings/new"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Add Learning
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Share what you learned today with the community
            </p>
          </Link>

          <Link
            href="/learnings"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Browse Learnings
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Discover what others are learning about AI
            </p>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Navigation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Home
            </Link>
            <Link
              href="/learnings"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              All Learnings
            </Link>
            <Link
              href="/profile"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              My Profile
            </Link>
            <Link
              href="/settings"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
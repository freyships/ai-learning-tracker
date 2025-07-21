# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Learning Tracker - A Next.js 15.4.2 application for documenting and sharing resources for learning to code with AI. Built with TypeScript and Tailwind CSS, following the App Router architecture.

## Common Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code linting

## Project Structure

- `app/` - Next.js App Router directory
  - `layout.tsx` - Root layout with Geist fonts and metadata
  - `page.tsx` - Home page with resource listing and filtering
  - `add-resource/page.tsx` - Form for adding new learning resources
  - `my-progress/page.tsx` - Personal progress tracking interface
  - `globals.css` - Global styles with dark mode support
- `types/index.ts` - TypeScript definitions for Resource, LearningProgress, and Learner
- `public/` - Static assets (SVG icons)

## Architecture Notes

- **Data Structure**: Uses TypeScript interfaces for Resource (learning materials), LearningProgress (tracking), and Learner (user profiles)
- **Resource Categories**: Tutorial, documentation, video, course, tool, book, article, podcast, community
- **Progress Tracking**: Status (not_started, in_progress, completed), percentage progress, time tracking, personal notes
- **Styling**: Tailwind CSS with full dark mode support using `dark:` classes
- **Client-side State**: React useState for form handling and progress updates (no backend currently)
- **Navigation**: Next.js Link components for client-side routing

## Key Features

- Resource discovery with category filtering and difficulty levels
- Personal progress tracking with notes and time spent
- Add new resources form with validation
- Responsive design with mobile-first approach
- Dark/light mode support throughout the application
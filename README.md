# Smart Language Learning App

A modern, production-ready language learning MVP inspired by Duolingo, but fully customizable.

## Features
- **Custom Deck Builder:** Add your own words and phrases.
- **Smart Lesson Generator:** Automatically creates daily lessons based on your progress.
- **SRS Engine:** Intelligent spaced repetition without manual "Easy/Hard" buttons.
- **Performance Analytics:** Tracks speed and accuracy to adapt difficulty.
- **Modern UI:** Built with React, Tailwind CSS, and Framer Motion.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Zustand, Framer Motion
- **Backend:** Hono (Cloudflare Workers)
- **Database:** Cloudflare D1 (SQLite)

## Setup Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm

### 2. Backend Setup
```bash
cd backend
npm install
# Initialize local database
npx wrangler d1 execute smart-language-db --local --file=schema.sql
# Start backend
npm run dev
```
The backend will run on `http://localhost:8787`.

### 3. Frontend Setup
```bash
cd frontend
npm install
# Start frontend
npm run dev
```
The frontend will run on `http://localhost:5173`.

### 4. Usage
1. Open the frontend in your browser.
2. Register a new account.
3. Create a deck (e.g., "German Travel").
4. Add some words to your deck.
5. Click "Start Lesson" to begin learning!

## Project Structure
- `backend/`: Hono API and D1 Database logic.
- `frontend/`: React application with Tailwind styling.
- `backend/schema.sql`: Database schema definition.

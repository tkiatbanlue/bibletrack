# Bible Reading Checklist Webapp

A lightweight, engaging webapp for seminary students to track Bible reading chapter-by-chapter with checklists, streaks, and competitive leaderboards.

## Features

- ✅ Intuitive checklist for tracking Bible reading (66 books × chapters)
- 🔥 Gamified features: Leaderboards, Streaks, Rising Stars
- 🔒 Secure login with email/password authentication
- ⚡ Fully client-side architecture with zero backend management
- 📱 Mobile-first, minimal, and visually inviting UI
- 🆓 Free-tier friendly for 100–1,000+ users

## Tech Stack

- **Frontend**: React
- **Authentication**: Firebase Authentication
- **Database**: Firestore (Firebase NoSQL)
- **Hosting**: Surge.sh

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd bible-reading-checklist
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Copy your Firebase configuration values
   - Create a `.env` file based on `.env.example` and update it with your Firebase credentials

5. Start the development server:
   ```
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with your Firebase configuration. See `.env.example` for the required variables.

**Important**: Never commit your `.env` file to version control as it contains sensitive credentials.

## Deployment

### Deploy to Surge.sh

1. Install Surge globally:
   ```
   npm install -g surge
   ```

2. Log in to Surge:
   ```
   surge login
   ```

3. Build and deploy:
   ```
   npm run build
   surge build
   ```

   Or use the deployment script:
   ```
   ./deploy.sh
   ```

### Deploy to Firebase Hosting

1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Initialize Firebase project:
   ```
   firebase init
   ```

4. Build and deploy:
   ```
   npm run build
   firebase deploy
   ```

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.js
│   │   └── Signup.js
│   ├── Layout.js
│   ├── Leaderboard.js
│   ├── RisingStars.js
│   └── StreakTracker.js
├── pages/
│   ├── Home.js
│   └── Profile.js
├── utils/
│   └── bibleData.js
├── firebase.js
└── App.js
```

## Development Phases

### Phase 1 – MVP (Completed)
- Firebase Auth integration
- Bible checklist with saved progress
- Leaderboard by class year
- Firestore security rules

### Phase 2 – Gamification (Completed)
- Streak tracking & visuals
- Rising Stars logic
- Animations + UX polish

### Phase 3 – Optional Enhancements
- Email summaries (e.g., weekly progress)
- Monthly leaderboards
- Dark mode toggle
- Offline caching (Firestore persistence)
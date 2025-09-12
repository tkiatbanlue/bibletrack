# Qwen Code Context & Setup Guide

## Project Overview
This is a Bible Reading Checklist web application built with React and Firebase. The app allows seminary students to track their Bible reading progress chapter-by-chapter with gamification features including streaks, leaderboards, and rising stars.

## Key Features Added by Qwen Code
1. **Internationalization (i18n)**
   - Language toggle between English and Thai
   - Full localization of all UI elements
   - Correct Thai translations for all Bible book names

2. **Group-based Organization**
   - Replaced class years with flexible group system
   - Users can select existing groups or create new ones
   - Leaderboard and Rising Stars organized by groups

3. **Enhanced User Experience**
   - Improved profile management with group selection
   - Better signup flow with group creation options

## Technologies Used
- React 19.1.1
- Firebase Authentication & Firestore
- i18next & react-i18next for internationalization
- Surge.sh for deployment

## Project Structure
```
src/
├── components/
│   ├── auth/          # Authentication components (Login, Signup)
│   ├── Layout.js      # Main layout with navigation
│   ├── LanguageToggle.js # Language switcher component
│   ├── Leaderboard.js # Leaderboard feature
│   ├── RisingStars.js # Rising Stars feature
│   └── StreakTracker.js # Streak tracking component
├── pages/
│   ├── Home.js        # Main checklist page
│   └── Profile.js     # User profile page
├── utils/
│   └── bibleData.js   # Bible book data
├── locales/           # Translation files
│   ├── en/            # English translations
│   └── th/            # Thai translations
├── firebase.js        # Firebase configuration
├── i18n.js            # Internationalization setup
└── App.js             # Main application component
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Surge.sh account (already installed)

### Installation Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd bibletrack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Copy your Firebase configuration values

4. Create environment file:
   ```bash
   cp .env.example .env
   ```
   Update the .env file with your Firebase credentials

5. Start the development server:
   ```bash
   npm start
   ```

### Deployment to Surge.sh
1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Surge (Surge is already installed):
   ```bash
   surge build
   ```

## Internationalization Details
- Translation files are located in `src/locales/`
- English translations in `src/locales/en/translation.json`
- Thai translations in `src/locales/th/translation.json`
- Language is automatically detected but can be manually switched
- All UI text is wrapped with translation functions

## Group System Implementation
- Users can select from existing groups or create new ones
- Groups are stored in a separate Firestore collection
- Leaderboard and Rising Stars are filtered by group instead of class year
- Profile and Signup forms updated to use group selection

## Recent Changes Made
1. Added i18n support with English/Thai translations
2. Replaced class year system with flexible group system
3. Updated all components to use translation functions
4. Modified Firestore rules to support groups
5. Updated documentation to reflect new features
6. Enabled public access to leaderboard and rising stars without login
7. Modified Rising Stars to show top readers by overall progress instead of recent activity
8. Updated version to v0.9.3

## Common Issues & Solutions
1. **Translation not showing**: Ensure all text is wrapped with `t()` function
2. **Group not saving**: Check Firestore rules and group creation logic
3. **Language not persisting**: Verify localStorage is working correctly
4. **Build errors**: Check for missing dependencies

## Future Enhancements
- Dark mode toggle
- Offline caching
- Email summaries
- Monthly leaderboards

## Important Reminders
- Do not test localhost with curl
- Surge.sh is already installed and configured
- Application is deployed at https://bibletrack.surge.sh
- Group feature replaces the old class year system completely
- Always commit changes to Git after deployment

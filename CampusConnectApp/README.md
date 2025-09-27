# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

# Tabs Copy - Simplified Campus Connect Screens

This folder contains simplified versions of the Campus Connect app screens that were created as backup copies for future development.

## Overview

These are minimal, placeholder versions of the main app screens that display welcome messages instead of full functionality. They were created to serve as a foundation for future development work.

## Current Structure

### Files Included:

- `_layout.tsx` - Tab navigation layout with 4 tabs
- `index.tsx` - Home screen (Welcome to Home)
- `study-space.tsx` - Study screen (Welcome to Study)
- `campus.tsx` - Campus screen (Welcome to Campus)
- `profile.tsx` - Profile screen (Welcome to Profile + Logout button)

### Current Functionality:

- **Home Tab**: Displays "Welcome to Home" message in blue color
- **Study Tab**: Displays "Welcome to Study" message in green color
- **Campus Tab**: Displays "Welcome to Campus" message in orange color
- **Profile Tab**: Displays "Welcome to Profile" message in purple color + functional logout button

## Tab Navigation

The `_layout.tsx` file configures a bottom tab navigation with:

- Home (house icon)
- Study (library icon)
- Campus (storefront icon)
- Profile (person icon)

## Profile Screen Special Features

The profile screen includes:

- Welcome message
- Logout button that shows confirmation dialog
- Navigation back to login screen on logout

## Usage Notes

- These are simplified placeholder screens
- All complex functionality has been removed
- Ready for future development and feature additions
- Each screen uses React Native Paper components for consistent styling
- Colors are used to differentiate between different tabs

## Future Development

These screens can be enhanced by:

- Adding actual functionality for each tab
- Implementing real data and API calls
- Adding more interactive components
- Expanding the user interface

## Technical Details

- Built with React Native and Expo Router
- Uses React Native Paper for UI components
- Ionicons for tab navigation icons
- TypeScript for type safety

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

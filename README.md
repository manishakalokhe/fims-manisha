# FIMS - Field Inspection Management System

A specialized mobile and web application for conducting field inspections with photo documentation and GPS location tracking.

## Features

- **Field Inspections**: Conduct detailed inspections with structured forms
- **Photo Documentation**: Upload and manage inspection photos
- **GPS Location Tracking**: Automatic location capture for inspections
- **Multi-language Support**: English and Marathi language support
- **Mobile Optimized**: Responsive design for mobile field work
- **Offline Capability**: Works offline with sync when connected

## Inspection Types

### Anganwadi Center Inspection
- Infrastructure and facilities assessment
- Equipment and materials verification
- Children information and records
- Nutrition and health services evaluation

### Office Inspection (दफ्तर निरीक्षण)
- Employee information and work assessment
- Letter correspondence details
- Registers and office structure evaluation
- Work quality assessment

## Integration

This application is designed to be integrated with a main website dashboard. Users will:

1. Access the main dashboard from the parent website
2. Click on the FIMS tab to be redirected to this application
3. Sign in using their existing credentials (shared authentication)
4. Access FIMS-specific functionality

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Internationalization**: i18next
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables for Supabase
4. Run development server: `npm run dev`

## Expo/React Native Setup

To test the mobile application with Expo:

### Prerequisites
1. Install Expo CLI globally: `npm install -g @expo/cli`
2. Install Expo Go app on your Android/iOS device
3. Ensure you have Node.js 16+ installed

### Setup Steps
1. Install dependencies: `npm install`
2. Set up your Supabase environment variables in `.env`
3. Start the Expo development server: `npx expo start`
4. Scan the QR code with Expo Go app (Android) or Camera app (iOS)

### Mobile-Specific Features
- **Bottom Navigation**: Dashboard, Inspections, New Inspection
- **Touch-Optimized UI**: Large touch targets and mobile-friendly interactions
- **Camera Integration**: Photo capture for inspection documentation
- **GPS Location**: Automatic location capture during inspections
- **Offline Support**: Forms can be filled offline and synced when connected

### Testing on Android
1. Install Expo Go from Google Play Store
2. Run `npx expo start` in your project directory
3. Scan the QR code with Expo Go app
4. The app will load on your Android device

### Testing on iOS
1. Install Expo Go from App Store
2. Run `npx expo start` in your project directory
3. Scan the QR code with your iPhone's Camera app
4. Tap the notification to open in Expo Go

## Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get these values:
1. Go to your Supabase project dashboard
2. Navigate to 'Project Settings' -> 'API'
3. Copy your 'Project URL' and 'anon public' key
4. Add them to your `.env` file
5. Restart the development server

## Deployment

The application can be deployed as a standalone web application that integrates with the main website through:

- Shared authentication system
- Common user roles and permissions
- Unified database structure

## User Roles

- **Inspector**: Conduct field inspections
- **Officer**: Review and approve inspections
- **Admin**: Full system access and user management

## Mobile Features

- Touch-optimized interface
- Camera integration for photo capture
- GPS location services
- Offline form completion
- Responsive design for various screen sizes
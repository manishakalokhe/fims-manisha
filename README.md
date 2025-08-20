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

## Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Get Supabase Credentials:

1. Go to your Supabase project dashboard
2. Navigate to 'Project Settings' -> 'API'
3. Copy your 'Project URL' and 'anon public' key
4. Add them to your `.env` file
5. Restart the development server

## Troubleshooting Connection Issues:

If you see "Failed to fetch" errors:

1. **Check your .env file exists** in the root directory (same level as package.json)
2. **Verify credentials** - Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
3. **Restart development server** - Run `npm run dev` again after changing .env
4. **Check browser console** - Look for detailed error messages about missing variables
5. **Verify Supabase project** - Ensure your Supabase project is active and accessible

Example .env file:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-long-anon-key-here
```

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
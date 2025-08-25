# Google OAuth Setup Guide

## Prerequisites

1. A Google Cloud Console project
2. Google Drive API enabled
3. OAuth 2.0 credentials configured

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API

### 2. Configure OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (for production)
5. Add authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - Your production domain (for production)
6. Copy the Client ID

### 3. Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id-here
```

### 4. API Scopes

The application requires the following Google Drive API scopes:
- `https://www.googleapis.com/auth/drive.file` - Access to files created by the app

### 5. Server Configuration

Make sure your AI processing server is running at `http://127.0.0.1:5000` or update the URL in the `pdf-upload.tsx` component.

## Features

- Google OAuth authentication
- PDF file upload to Google Drive
- Automatic folder creation ("AI-TakeOff")
- File sharing for AI processing
- Company and jobsite selection
- Real-time processing logs

## Usage

1. Sign in with Google
2. Select a PDF file
3. Choose company and jobsite
4. Upload and process the file
5. View analysis results

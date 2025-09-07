# Google OAuth Setup Guide

## Prerequisites

1. A Google Cloud Console project
2. Google Drive API enabled
3. OAuth 2.0 credentials configured
4. OpenAI API key (for text enhancement feature)

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

### 3. OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the API key

### 4. Environment Variables

Create a `.env.local` file in the root directory with:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id-here
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your-actual-client-secret-here

# API Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
```

### 5. Server Configuration

Make sure your AI processing server is running at `http://127.0.0.1:5000` or update the URL in the `pdf-upload.tsx` component.

## Features

- Google OAuth authentication with **automatic token refresh**
- PDF file upload to Google Drive
- Automatic folder creation ("AI-TakeOff")
- File sharing for AI processing
- Company and jobsite selection
- Real-time processing logs
- **NEW: Extracted text display and AI enhancement**
- **NEW: OpenAI-powered text rewriting and professional formatting**
- **NEW: Automatic token refresh - no more re-authentication after 1 hour!**
- **NEW: Previous Take Offs section - view and manage all processed documents**

## Usage

1. Sign in with Google
2. Select a PDF file
3. Choose company and jobsite
4. Upload and process the file
5. View analysis results including:
   - Processing summary with metadata
   - Extracted text from the PDF
   - AI-enhanced version of the text (click "Enhance with AI")
   - Generated images and visual analysis
   - Shape detection statistics
   - Complete raw data

## New Features

### Extracted Text Enhancement
- Displays raw text extracted from PDF documents
- "Enhance with AI" button to rewrite text using OpenAI
- Professional formatting and improved readability
- Construction and engineering-focused analysis
- Structured output with clear sections and recommendations

### Previous Take Offs Management
- View all previously processed PDF documents
- Filter and search through historical data
- Display key metrics: detection counts, file details, processing status
- Company and jobsite information for each take-off
- Quick access to view and download results
- Responsive grid layout with detailed cards
- Real-time data fetching from database

# Leapbod

A modern student opportunities platform that connects students with internships, scholarships, events, and other valuable opportunities. Built with React, TypeScript, and Supabase.

## 🌟 Features

- **Student Portal**: Discover and apply to approved opportunities
- **Opportunity Submission**: Submit new opportunities for admin review
- **Admin Dashboard**: Manage and moderate opportunity submissions
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Mobile-first, accessible interface
- **Real-time Updates**: Live status tracking for submissions

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Icons**: Lucide React, React Icons

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account and project

## 🛠️ Installation

1. Clone the repository

```bash
git clone <repository-url>
cd leapbod
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server

```bash
npm run dev
```

## 🗄️ Database Setup

Run the SQL scripts in the `database/` directory to set up your Supabase schema:

1. `001_initial_schema.sql` - Creates the initial database structure
2. `002_remove_images.sql` - Removes image-related columns

## 📱 Usage

### For Students

- Register/Login to access the platform
- Browse approved opportunities
- Submit new opportunities for review
- Track submission status
- Apply to opportunities of interest

### For Admins

- Access the admin dashboard
- Review pending opportunity submissions
- Approve, reject, or edit opportunities
- Manage user submissions

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── lib/               # Utility functions and configurations
├── pages/             # Page components
├── types/             # TypeScript type definitions
└── assets/            # Static assets
```

## 🚀 Deployment

The project is configured for deployment on Vercel. Simply connect your repository and deploy:

```bash
npm run build
```

## 📄 License

This project is licensed under the MIT License.

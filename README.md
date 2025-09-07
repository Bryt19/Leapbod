# Leapbod 🚀

A modern student opportunities platform that connects students with internships, scholarships, events, and career opportunities. Built with React, TypeScript, and Supabase.

## ✨ Features

- **Student Portal**: Discover and apply to approved opportunities
- **Opportunity Submission**: Submit new opportunities for admin review
- **Admin Dashboard**: Manage and moderate all submissions
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Mobile-first, accessible interface
- **Real-time Updates**: Live status tracking for submissions

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router DOM
- **Icons**: Lucide React, React Icons

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

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

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── ...             # Feature-specific components
├── contexts/           # React contexts (Auth, etc.)
├── pages/              # Route components
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

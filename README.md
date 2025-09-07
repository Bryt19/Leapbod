# Leapbod

A modern platform connecting students with opportunities including internships, scholarships, competitions, events, jobs, and research positions.

## 🚀 Features

- **Comprehensive Opportunity Discovery**: Browse opportunities across multiple categories
- **Smart Search & Filtering**: Find relevant opportunities with advanced filtering options
- **User Dashboard**: Track bookmarked opportunities and manage submissions
- **Admin Panel**: Manage opportunities and user submissions
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Updates**: Stay informed with the latest opportunities

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Database, Authentication, Real-time)
- **Icons**: React Icons (Heroicons)
- **Routing**: React Router DOM

## 🏃‍♂️ Quick Start

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
# Add your Supabase credentials
```

4. Start the development server

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── contexts/           # React contexts (Auth, etc.)
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
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

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)

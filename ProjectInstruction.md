# LEAPBOD: Student Events and Opportunities Platform

> 💡 **Cursor Prompt:**  
> “You're a senior developer. Based on this markdown spec, scaffold the project features using Supabase (backend/auth/database) and Vite + React + Tailwind (frontend). Build it clean, modular, and production-friendly. Use functional components, hooks, auth context, protected routes, and clearly separate student/admin flows.”

---

## 🌍 Overview

Leapbod is a platform that allows students to discover, submit, and apply to opportunities like internships, scholarships, events, and more. Submitted opportunities are subject to admin approval before being visible to others.

---

## ✅ Functional Requirements

- User registration and login
- View only **approved** opportunities
- Submit opportunities (stored as `pending`)
- Track submission status (pending, approved, rejected)
- Apply or bookmark opportunities
- Admin can approve, reject, or edit any submission

---

## ⚙️ Non-Functional Requirements

- Mobile responsive UI
- Intuitive UX for students and admins
- Secure authentication & data management
- Notification system for status changes

---

## 🧑‍💼 Actors

- **Student:** regular user
- **Admin:** elevated user with moderation rights

---

## 🔄 Use Cases

### Student

- Register/Login
- View approved opportunities
- Submit a new opportunity
- View status of submissions

### Admin

- View all pending submissions
- Approve/Reject/Edit opportunities
- Manage user submissions

---

## 🧱 Database Schema (PostgreSQL / Supabase)

```sql
-- Users handled by Supabase Auth
-- Add this for additional profile info if needed
create table profiles (
  id uuid references auth.users on delete cascade,
  role text default 'student',
  primary key (id)
);

create table opportunities (
  id uuid primary key default uuid_generate_v4(),
  title text,
  description text,
  category text,
  deadline date,
  submitted_by uuid references auth.users(id),
  status text default 'pending',
  created_at timestamp default now()
);

create table bookmarks (
  user_id uuid references auth.users(id),
  opportunity_id uuid references opportunities(id),
  primary key (user_id, opportunity_id)
);

create table applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  opportunity_id uuid references opportunities(id),
  status text default 'applied',
  created_at timestamp default now()
);
```

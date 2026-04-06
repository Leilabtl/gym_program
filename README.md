# 🏋️ Gym Logger

A premium, mobile-first **Progressive Web App (PWA)** designed for minimal, fast, and tactile workout tracking. Built with the latest Next.js 15, Firebase, and a sleek modern design.

![Gym Logger Preview](https://github.com/Leilabtl/gym_program/blob/main/public/app-preview.png?raw=true) *(Placeholder for preview)*

## ✨ Features

- **📱 Mobile-First PWA**: Installable on iOS and Android for a native app-like experience.
- **🔐 Secure Authentication**: Firebase Google Sign-In for seamless and secure access.
- **⚡ Fast Tracking**: Log your sets in seconds with a high-tactile interface.
- **🗓️ History & Analytics**: Track your progress over time with detailed session logs.
- **📁 Templates & Movements**: Organize your workouts with custom templates and pre-seeded common movements.
- **🌓 Adaptive Theme**: Sleek dark-mode first design optimized for gym environments.

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Auth**: [Firebase (Firestore & Authentication)](https://firebase.google.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- A Firebase Project

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Leilabtl/gym_program.git
   cd gym_program
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Visit the app**: Open [http://localhost:3000](http://localhost:3000)

## 📦 Deployment

This project is ready to be deployed on [Vercel](https://vercel.com/) or [Firebase Hosting](https://firebase.google.com/docs/hosting). 

## 🛡️ License

MIT © [Leila Btl](https://github.com/Leilabtl)

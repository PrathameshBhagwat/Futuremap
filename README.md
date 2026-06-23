# 🚀 FutureMap: AI-Powered Career Advisor

> **An Intelligent Platform for Personalized Career Guidance & Educational Discovery**

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)](https://supabase.com/)

---

## 📌 Project Overview
**FutureMap** is a comprehensive Final Year Project built to help students discover their ideal career paths. By leveraging AI algorithms and interactive visualizations, the platform transforms the often confusing journey of career planning into a clear, structured, and engaging experience.

---

## ✨ Key Features

### 🧠 Interactive Career Discovery
* **AI-Powered Assessment Quiz**: Evaluates user interests, skills, and preferences to recommend tailored career paths.
* **Smart Roadmap Generation**: Creates personalized, step-by-step learning roadmaps with actionable milestones.
* **Downloadable Roadmaps**: Export your customized career journey directly to a PDF for offline tracking.

### 🎮 Immersive Experience
* **3D Career Visualizations**: Uses WebGL and Three.js to provide an interactive, visual representation of career branches and learning paths.
* **Gamified Progress Tracking**: Earn achievements and maintain streaks as you complete learning milestones.

### 🏛️ Educational Resources
* **College Database**: Search, filter, and discover engineering and technical colleges.
* **Resource Hub**: Access curated learning materials tailored to your specific career goals.

---

## 🛠️ Technology Stack

<details>
<summary><b>Frontend</b></summary>
<br>

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **3D Rendering:** Three.js + React Three Fiber
* **Icons:** Lucide React
</details>

<details>
<summary><b>Backend & Database</b></summary>
<br>

* **Database:** PostgreSQL (hosted on Supabase)
* **ORM:** Prisma
* **Authentication:** Supabase Auth
* **API:** Next.js Server Actions & API Routes
</details>

<details>
<summary><b>AI & Integrations</b></summary>
<br>

* **AI Provider:** Multi-model support (Hugging Face, Cohere, etc.)
* **Analytics:** Vercel Speed Insights
</details>

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/FutureMap.git
   cd FutureMap
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_postgresql_connection_string
   HUGGINGFACE_API_KEY=your_api_key
   ```

4. **Initialize the Database:**
   Push the Prisma schema to your Supabase instance:
   ```bash
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Meet the Team

This project was developed as a Final Year Engineering Project by:

* **[Your Name/Teammate 1]** - *Full Stack Developer*
* **[Teammate 2 Name]** - *Frontend & UI/UX*
* **[Teammate 3 Name]** - *AI & Backend Integrations*
* **[Teammate 4 Name]** - *Database & DevOps*

**Guided By:** [Professor / Guide Name]

---

## 📝 License
This project is licensed under the MIT License.
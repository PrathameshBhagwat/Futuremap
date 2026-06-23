<div align="center">
  
# 🌌 FutureMap
### Next-Generation AI-Powered Career Guidance & Educational Discovery

*Transforming student futures from guesswork to data-driven, personalized roadmaps.*

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)

</div>

---

## 🎯 The Vision
**FutureMap** is an advanced Final Year Project engineered to solve one of the biggest challenges students face today: **"What should I do next?"**

By fusing cutting-edge Large Language Models (LLMs), immersive 3D data visualization, and a robust scalable backend, FutureMap provides students with tailored, interactive, and highly structured career trajectories. 

---

## 🚀 Core Innovations & Features

### 🧠 **Intelligent Career Assessment**
* **Dynamic Analysis:** Processes user skills, academic background, and personal interests through an AI inference engine.
* **Smart Matching:** Aligns student profiles with optimal career clusters ranging from Software Engineering to Data Science and beyond.

### 🗺️ **Personalized Roadmap Engine**
* **Step-by-step Milestones:** Generates sequential learning nodes covering foundational basics to advanced mastery.
* **Portable PDF Export:** Seamlessly compile and download your entire career trajectory into a beautifully formatted PDF for offline tracking.
* **Real-time Progress Sync:** Dashboard syncs instantly as you complete quizzes and achieve milestones.

### 🎮 **Immersive 3D Visualizer**
* **WebGL-Powered Trees:** Explore your career options through an interactive 3D particle and node system powered by `React Three Fiber`.
* **Hardware-Accelerated:** Smooth 60FPS animations bringing data visualization to life.

### 🏛️ **Extensive College & Resource Database**
* **Smart Filtering:** Query our comprehensive database of engineering colleges by location, cutoff, fee structure, and ratings.
* **Curated Knowledge Hub:** Access a library of high-quality, AI-recommended learning materials mapped directly to your active roadmap phase.

---

## 🏗️ System Architecture

FutureMap is built on a modern, enterprise-grade technology stack ensuring security, speed, and scalability.

<details>
<summary><b>💻 Frontend: The Presentation Layer</b></summary>
<br>

- **Next.js 15 (App Router):** Utilizes React Server Components for lightning-fast page loads and optimized SEO.
- **Tailwind CSS & Framer Motion:** Provides a "Glassmorphic", futuristic dark-mode UI with fluid micro-animations.
- **Three.js & WebGL:** Renders the complex 3D career trees directly in the browser.
</details>

<details>
<summary><b>⚙️ Backend: The Logic Layer</b></summary>
<br>

- **Next.js API Routes:** Secure, serverless functions handling complex logic and rate-limiting.
- **Multi-Model AI Integration:** Capable of connecting to Hugging Face, Cohere, or local LLMs for generative tasks.
- **Puppeteer & JSPDF:** Server-side generation of high-fidelity PDF documents.
</details>

<details>
<summary><b>🗄️ Database: The Data Layer</b></summary>
<br>

- **Supabase (PostgreSQL):** A highly scalable, relational database handling user states, roadmaps, and college data.
- **Prisma ORM:** Ensures 100% end-to-end type safety between the database and the frontend interfaces.
</details>

---

## ⚡ Setup & Deployment

Want to run FutureMap locally? Follow these steps:

### 1️⃣ Clone & Install
```bash
git clone https://github.com/your-username/FutureMap.git
cd FutureMap
npm install
```

### 2️⃣ Environment Configuration
Create a `.env.local` file at the root of the project with your secure keys:
```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
DATABASE_URL="postgresql://user:pass@host:5432/postgres"

# AI Provider (Optional)
HUGGINGFACE_API_KEY="your-api-key"
```

### 3️⃣ Database Initialization
Synchronize the Prisma schema with your PostgreSQL database:
```bash
npx prisma db push
```

### 4️⃣ Launch the Engine
```bash
npm run dev
```
Navigate to `http://localhost:3000` to start exploring!

---

## 👥 The Engineering Team

This platform was conceptualized, designed, and engineered as a Final Year Academic Project by:

| Team Member | Primary Role |
| :--- | :--- |
| **[Your Name]** | Full Stack Architecture & Database |
| **[Teammate 2]** | Frontend UI/UX & 3D Visualization |
| **[Teammate 3]** | AI Integration & Backend Logic |
| **[Teammate 4]** | API Development & Testing |

**Under the expert guidance of:** [Professor / Guide Name]

---

<div align="center">
  <p><i>"The best way to predict the future is to invent it."</i></p>
</div>
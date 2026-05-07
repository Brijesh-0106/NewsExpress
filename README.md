<div align="center">
  <!-- Placeholder for a Hero Banner Image -->
  <img src="https://via.placeholder.com/1200x400/1a1a1a/ffffff?text=NewsExpress+-+Dark+Luxury+News" alt="NewsExpress Banner" width="100%" />

  # 🚀 NewsExpress

  <p align="center">
    A premium, fully-featured news application designed with a sophisticated "Dark Luxury" aesthetic.
  </p>
  
  <!-- Badges -->
  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Pinecone-000000?style=for-the-badge&logo=pinecone&logoColor=white" alt="Pinecone" />
    <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions" />
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
  </p>
</div>

---

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
- [📸 Visuals](#-visuals)
- [🚀 Technology Stack](#-technology-stack)
- [🛠️ Getting Started](#️-getting-started)
- [📂 Project Structure](#-project-structure)
- [📜 License](#-license)

---

## ✨ Key Features

- **Premium "Dark Luxury" UI:** A stunning, mobile-responsive design system featuring masonry grid layouts, high-contrast styling, and smooth interactions for a top-tier visual experience.
- **RAG-Powered AI News Assistant:** Built with Xenova (Transformers.js) and Pinecone, the platform includes a context-aware AI assistant. Users can directly query specific news stories, get intelligent summaries, and enjoy seamless stream-rendered markdown responses.
- **Automated Morning Digests:** A robust subscription system backed by Supabase for subscriber management and GitHub Actions for backend automation. Users receive daily automated news digests right in their inbox (powered by EmailJS).
- **Advanced News Filtering:** Integrated with the NewsData.io API, providing accurate regional news filtering, persistent search queries, and an intuitive user interface to discover global and local events.
- **Interactive Discoverability:** Features context-aware hover mechanisms and card-level AI querying, allowing users to dive deeper into any topic instantly.

---

## 📸 Visuals

*(Note: Replace the placeholder URLs below with your actual project screenshots by uploading them to an `assets` folder or directly into GitHub issues/PRs and pasting the link).*

### 🖥️ Website Interface
<img src="https://via.placeholder.com/800x450/1a1a1a/ffffff?text=Add+Website+Screenshot+Here" alt="Website UI Screenshot" width="100%" />

### 📱 Mobile Experience
<div align="center">
  <img src="https://via.placeholder.com/300x600/1a1a1a/ffffff?text=Mobile+UI+Screenshot" alt="Mobile UI" width="30%" />
</div>

### ✉️ Automated Morning Digest Email
<img src="https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Add+Email+Digest+Screenshot+Here" alt="Email Digest Screenshot" width="100%" />

---

## 🚀 Technology Stack

- **Frontend:** React.js, React Router
- **AI & Vector DB:** `@xenova/transformers`, Pinecone
- **Backend/Database:** Supabase (for persistent subscriber storage)
- **Automation & Email:** GitHub Actions (CRON jobs), EmailJS
- **News API:** NewsData.io API

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20.x or higher)
- npm or yarn
- API Keys for NewsData.io, Pinecone, Supabase, and EmailJS.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd NewsExpress
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your respective API keys:
   ```env
   REACT_APP_NEWSDATA_API_KEY=your_newsdata_api_key
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_PINECONE_API_KEY=your_pinecone_api_key
   # Add other required keys (e.g., EmailJS)
   ```

4. **Run the application:**
   ```bash
   npm start
   ```
   The app will run in development mode at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

- `src/components/` - Reusable UI components (NavBar, MainNews, etc.)
- `.github/workflows/` - CI/CD and serverless automation scripts (e.g., `morning-digest.yml`)
- `public/` - Static assets and manifest files

---

## 📜 License
This project is open-source and available under the MIT License.

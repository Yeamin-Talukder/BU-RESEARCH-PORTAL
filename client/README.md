# BU Research Portal - Client

The frontend application for the Barishal University Research Portal, built for a premium user experience in manuscript management and academic publishing.

## 🚀 Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [React Fullpage](https://github.com/alvarotrigo/react-fullpage)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (Primitives) & [Lucide React](https://lucide.dev/) (Icons)
- **State/Routing**: [React Router 7](https://reactrouter.com/)
- **Backend Services**: [Firebase](https://firebase.google.com/) (Auth/Analytics)

## 🎨 Design System

The platform features a **Premium Academic Aesthetic** designed to minimize digital glare and maximize readability.

- **Color Palette**:
  - `Archival Bone (#FDFBF7)`: Warm paper tone background.
  - `Classic Ink (#1A1A1A)`: High-contrast text color.
  - `Oxford Blue (#1B365D)`: University branding and primary actions.
  - `Vellum Gold (#B59461)`: Accents for badges and honors.
- **Typography**:
  - `Crimson Pro`: Authoritative serif for headers and journal names.
  - `EB Garamond`: Historical standard for body text and manuscripts.
  - `Public Sans`: Clean sans-serif for functional UI and navigation.

## ✨ Key Features

- **Snap Scroll Homepage**: Immersive, sectioned scrolling experience with modern micro-animations.
- **Role-Based Dashboards**: Intelligent dashboards tailored for Authors, Reviewers, Editors, and Admins.
- **Dynamic Role Switcher**: Seamlessly switch between assigned roles (e.g., Author to Reviewer).
- **Navigation & Notifications**: Persistent sidebar/navbar with real-time notification modal and system alerts.
- **Manuscript Workflow**: Interactive submission forms, status timelines, and revision tracking.

## ⚙️ Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root directory (copy from `.env.example` if available) and add your Firebase and API configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_API_URL=http://localhost:3001
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 📁 Project Structure

- `src/components/`: Reusable UI components (Hero, Nav, Dashboard, etc.).
- `src/context/`: React context providers for Authentication and Global State.
- `src/types/`: TypeScript definitions and interfaces.
- `src/lib/`: Utility functions and third-party configurations.
- `Firebase.ts`: Firebase SDK initialization.
- `App.tsx`: Main routing and layout assembly.
- `index.css`: Global styles and Tailwind configuration.

## 🏗️ Build for Production

```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` folder.

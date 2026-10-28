# Dev Bhoomi Site - Frontend

This is the frontend application for the Dev Bhoomi Site, built using React and Vite. It provides a modern, responsive, and interactive user interface for the platform, including dedicated portals for Administration (CMS) and Academics (ERP).

## ✨ Features

- **Blazing Fast Setup & Hot Reloading:** Powered by Vite.
- **Modern Styling:** Utility-first CSS architecture using Tailwind CSS v4.
- **Client-Side Routing:** Smooth navigation without page reloads using React Router DOM.
- **Admin Dashboard (CMS):** Secure, protected routes for administrators to manage media, notices, testimonials, users, and affiliations dynamically.
- **Academic Portal (ERP):** Dedicated interfaces for managing student profiles, class attendance, assignments, and study materials.
- **API Integration:** Robust HTTP requests handling with Axios.
- **User Feedback:** Elegant toast notifications using `react-hot-toast`.
- **Form & Email Handling:** Integrated with `@emailjs/browser` for direct client-side email sending.
- **Image Cropping:** User-friendly image manipulation using `react-easy-crop`.

## 🏢 ERP & CMS Interfaces

The frontend is divided into public-facing pages and protected management portals:

### ERP Portal (`/src/pages/erp`)
The ERP interface is built for students and faculty. It provides UI components to:
- View and update student details.
- Record and check attendance logs.
- Download and upload study materials and assignments.
- View class schedules and internal notifications.

### CMS Admin Panel (`/src/pages/admin`)
The CMS interface is strictly for administrators. It provides a comprehensive dashboard to:
- Manage the public website's content (Notices, Testimonials, Affiliations).
- Manage cloud media assets visually.
- Manage system settings and user roles.

## 🛠️ Technologies Used

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [React Router DOM](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [React Hot Toast](https://react-hot-toast.com/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Setup
Create a `.env` file in the root of the `frontend` directory. Add your environment-specific variables:
```env
VITE_API_BASE_URL=http://localhost:5000/api
# Add other necessary variables
```

## 📜 Available Scripts

- **`npm run dev`**: Runs the app in development mode at [http://localhost:5173](http://localhost:5173).
- **`npm run build`**: Builds the app for production to the `dist` folder.
- **`npm run lint`**: Runs ESLint to check for code quality.
- **`npm run preview`**: Locally preview the production build.

## 📁 Directory Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── admin/       # (CMS) Admin Dashboard components & pages
│   ├── erp/         # (ERP) Academic portal components & pages
│   ├── assets/      # Images, icons
│   ├── components/  # Reusable UI components
│   ├── pages/       # Public route-level components
│   ├── context/     # React Context (Auth state, etc.)
│   ├── hooks/       # Custom React hooks
│   ├── utils/       # Utility functions
│   ├── App.jsx      # Main routing setup
│   └── main.jsx     # Application entry point
├── index.html       # Main HTML file
├── vite.config.js   # Vite configuration
└── package.json     # Dependencies
```

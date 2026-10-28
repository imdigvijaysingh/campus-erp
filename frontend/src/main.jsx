import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import axios from 'axios'

// Set global base URL for all direct axios calls in the app
axios.defaults.baseURL = import.meta.env.DEV ? "http://localhost:5000" : "https://Shyvora-full-stack-backend.onrender.com";

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
)

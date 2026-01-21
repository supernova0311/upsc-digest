/**
 * APP.JSX - MAIN APPLICATION COMPONENT
 * 
 * This is the root component of the application that handles:
 * 1. Routing - Define all application routes
 * 2. Authentication - Protected routes that require login
 * 3. Layout - Sidebar navigation and page structure
 * 4. Global Components - AI Assistant (floating chat)
 */

import React from 'react';
// HashRouter enables client-side routing (URLs with #)
// Routes & Route for defining URL paths
// Navigate to redirect users
// Outlet to render child components in protected routes
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import all page components
import { Layout } from './components/Layout'; // Sidebar + main layout
import { AIAssistant } from './components/AIAssistant'; // Floating chat widget
import { Dashboard } from './pages/Dashboard'; // Home page
import { NewsScraper } from './pages/NewsScraper'; // News scraping page
import { SavedNotes } from './pages/SavedNotes'; // Saved notes library
import { Login } from './pages/Login'; // Authentication page
import { authService } from './services/authService'; // Authentication logic

/**
 * PROTECTED ROUTE COMPONENT
 * 
 * This component checks if the user is authenticated:
 * - If YES: Shows the page with Layout (sidebar + content)
 * - If NO: Redirects to login page
 */
const ProtectedRoute = () => {
  // Get stored authentication info from localStorage
  const { isAuthenticated } = authService.getStoredAuth();
  
  // If authenticated, render the layout with page content
  // <Outlet /> is where the child routes will render (Dashboard, NewsScraper, etc.)
  return isAuthenticated ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    // If not authenticated, redirect to login page
    <Navigate to="/login" replace />
  );
};

/**
 * MAIN APP COMPONENT
 * 
 * Defines all routes and the main structure of the application
 */
function App() {
  return (
    <HashRouter>
      {/* AI Assistant - Floating chat widget that appears on all pages */}
      <AIAssistant />
      
      {/* Define all application routes */}
      <Routes>
        {/* PUBLIC ROUTE: Login/Register page - no authentication needed */}
        <Route path="/login" element={<Login />} />
        
        {/* PROTECTED ROUTES: Require authentication to access */}
        {/* ProtectedRoute checks if user is logged in before showing these pages */}
        <Route element={<ProtectedRoute />}>
          {/* Home/Dashboard page */}
          <Route path="/" element={<Dashboard />} />
          
          {/* News Scraping page */}
          <Route path="/scraper" element={<NewsScraper />} />
          
          {/* Saved Notes library page */}
          <Route path="/notes" element={<SavedNotes />} />
        </Route>

        {/* CATCH-ALL ROUTE: Any unknown URL redirects to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

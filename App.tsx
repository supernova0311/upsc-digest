import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AIAssistant } from './components/AIAssistant';
import { Dashboard } from './pages/Dashboard';
import { NewsScraper } from './pages/NewsScraper';
import { SavedNotes } from './pages/SavedNotes';
import { Login } from './pages/Login';
import { authService } from './services/authService';

const ProtectedRoute = () => {
  const { isAuthenticated } = authService.getStoredAuth();
  return isAuthenticated ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <HashRouter>
      <AIAssistant />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scraper" element={<NewsScraper />} />
          <Route path="/notes" element={<SavedNotes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
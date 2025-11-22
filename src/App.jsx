import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // <--- Importamos o Carteiro

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewProblem from './pages/NewProblem';
import ProblemDetails from './pages/ProblemDetails';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      {/* O Toaster fica aqui, vigiando o app todo */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#ecfdf5', // Verde clarinho
              color: '#065f46',      // Verde escuro
              border: '1px solid #a7f3d0'
            },
          },
          error: {
            style: {
              background: '#fef2f2', // Vermelho clarinho
              color: '#991b1b',      // Vermelho escuro
              border: '1px solid #fecaca'
            },
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-problem" element={<NewProblem />} />
        <Route path="/problem/:id" element={<ProblemDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
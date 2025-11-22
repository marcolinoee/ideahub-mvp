import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importando todas as nossas páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewProblem from './pages/NewProblem.jsx'; // <--- Importamos a página nova aqui

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rotas do Sistema */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Nova Rota de Cadastro de Problema */}
        <Route path="/new-problem" element={<NewProblem />} />
      </Routes>
    </BrowserRouter>
  );
}
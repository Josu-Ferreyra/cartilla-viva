import React from 'react';
import { createRoot } from 'react-dom/client';
import './estilos/tokens.css';
import './estilos/base.css';
import { AppProvider } from './core/store.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode><AppProvider><App /></AppProvider></React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// Punto de entrada seguro
const container = document.getElementById('root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Error crítico: No se encontró el elemento 'root' en el DOM.");
}
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Importa o seu App.jsx
import './index.css'    // Importa seus estilos globais

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

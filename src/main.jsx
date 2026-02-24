import React from "react"
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { DateProvider } from './context/DateContext'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DateProvider>
      <App />
    </DateProvider>
  </React.StrictMode>,
)

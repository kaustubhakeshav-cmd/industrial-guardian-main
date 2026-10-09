import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 1. Import the Provider we just created
import { AppProvider } from './context/AppContext' 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Wrap the App with AppProvider */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>,
)
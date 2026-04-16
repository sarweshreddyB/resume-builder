import React from 'react'
import ReactDOM from 'react-dom/client'
import { Router } from 'wouter'
import { useHashLocation } from 'wouter/use-hash-location'
import App from './App.jsx'
import './App.css'

// Hash-based routing (/#/, /#/editor) works with GitHub Pages static hosting
// without any server-side redirect configuration.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router hook={useHashLocation}>
      <App />
    </Router>
  </React.StrictMode>,
)

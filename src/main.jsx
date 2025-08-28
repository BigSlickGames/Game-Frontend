
import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return (
    <div style={maxWidth: 900, margin: '4rem auto', fontFamily: 'Inter, system-ui, Arial'}>
      <h1>Game Frontend</h1>
      <p>Welcome! This is the Game Frontend React app template.</p>
      <ul>
        <li>Update UI in <code>src/main.jsx</code></li>
        <li>Run <code>npm run dev</code> for local dev</li>
        <li>Build with <code>npm run build</code> and <code>npm run preview</code></li>
      </ul>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

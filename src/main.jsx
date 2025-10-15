
import React from 'react'
import ReactDOM from 'react-dom/client'
import { api } from './api'

function App() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  const sendData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.postData({ message: 'Hello from frontend!' })
      console.log('Data sent successfully:', result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth: 900, margin: '4rem auto', fontFamily: 'Inter, system-ui, Arial', padding: '0 2rem'}}>
      <h1>Game Frontend</h1>
      <p>Using local in-memory storage</p>

      <div style={{marginBottom: '2rem'}}>
        <button
          onClick={sendData}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Sending...' : 'Send Data'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{marginTop: '2rem', fontSize: '0.9em', color: '#666'}}>
        <h3>Instructions:</h3>
        <ol>
          <li>Click "Send Data" to add a new item</li>
          <li>Data is stored in memory (resets on page refresh)</li>
        </ol>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

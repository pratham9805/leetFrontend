
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from "react-redux"
import { store } from './store/store.js'
import { BrowserRouter } from 'react-router'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#161b27',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '13px',
              fontWeight: 600
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#161b27' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#161b27' } }
          }}
        />
      </BrowserRouter>
    </Provider>
  </GoogleOAuthProvider>
)


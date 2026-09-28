import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ResumeProvider } from './resumeStore'

createRoot(document.getElementById('root')!).render(<StrictMode><ResumeProvider><App /></ResumeProvider></StrictMode>)

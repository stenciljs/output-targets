import './index.css'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { TagTransformerInit } from './TagTransformerInit'
import App from './App'

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <StrictMode>
    <TagTransformerInit />
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

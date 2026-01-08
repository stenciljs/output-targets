import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { TagTransformerInit } from './TagTransformerInit'
import App from './App'

export function render(url: string) {
  const html = renderToString(
    <StrictMode>
      <TagTransformerInit />
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
  return { html }
}

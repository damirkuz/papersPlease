import { createRoot } from 'react-dom/client'
import { App } from './App'
import { manifest } from './content/manifest'
import { parseCases } from './content/schema'
import { ui } from './content/strings'
import '@fontsource/roboto-condensed/cyrillic-400.css'
import '@fontsource/roboto-condensed/latin-400.css'
import '@fontsource/roboto-condensed/cyrillic-700.css'
import '@fontsource/roboto-condensed/latin-700.css'
import '@fontsource/ibm-plex-mono/cyrillic-600.css'
import '@fontsource/ibm-plex-mono/latin-600.css'
import './styles/tokens.css'
import './styles/game.css'

const root = createRoot(document.getElementById('root')!)
try {
  root.render(<App cases={parseCases(manifest)} />)
} catch (error) {
  console.error(error)
  root.render(<main className="content-error">
    <h1>{ui.badContent}</h1>
    {import.meta.env.DEV && <pre>{error instanceof Error ? error.message : String(error)}</pre>}
  </main>)
}

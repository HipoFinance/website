// The Buffer polyfill moved into ./chain.ts, which is the only place that needs it (the TON
// libraries) and is now loaded on demand. Importing it here would have pulled `buffer` back into
// the eager chunk for every visitor.
import App from './App.tsx'

export default function AppIsland() {
  return <App />
}

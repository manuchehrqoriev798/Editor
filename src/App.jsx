import './App.css'
import ArrayVisualizer from './components/arrayVisualizer'
import LinkedListVisualizer from './components/LinkedListVisualizer'
import GraphVisualizer from './components/GraphVisualizer'

function App() {
  return(
    <div className="App">
      <ArrayVisualizer />
      <LinkedListVisualizer />
      <GraphVisualizer />
    </div>
  )
}

export default App

import './App.css'
import { useState } from 'react'
import GraphVisualizer from './components/GraphVisualizer'
import DirectedGraphVisualizer from './components/DirectedGraphVisualizer'
import TreeVisualizer from './components/TreeVisualizer'

function App() {
  const [activeVisualizer, setActiveVisualizer] = useState(null);

  const handleActivate = (visualizer) => {
    setActiveVisualizer(visualizer);
  };

  if (activeVisualizer) {
    // Render only the active visualizer
    switch (activeVisualizer) {
      case 'graph':
        return <GraphVisualizer onBack={() => setActiveVisualizer(null)} />;
      case 'directed':
        return <DirectedGraphVisualizer onBack={() => setActiveVisualizer(null)} />;
      case 'tree':
        return <TreeVisualizer onBack={() => setActiveVisualizer(null)} />;
    }
  }

  // Render selection buttons when no visualizer is active
  return (
    <div className="App">
      <div className="visualizer-selection">
        <button 
          className="visualizer-btn"
          onClick={() => handleActivate('graph')}
        >
          Graph Visualizer
        </button>
        <button 
          className="visualizer-btn"
          onClick={() => handleActivate('directed')}
        >
          Directed Graph Visualizer
        </button>
        <button 
          className="visualizer-btn"
          onClick={() => handleActivate('tree')}
        >
          Tree Visualizer
        </button>
      </div>
    </div>
  );
}

export default App

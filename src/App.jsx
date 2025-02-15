import './App.css'
import { useState } from 'react'
import GraphVisualizer from './components/GraphVisualizer'
import TreeVisualizer from './components/TreeVisualizer'
import LinkedListVisualizer from './components/LinkedListVisualizer'
import StackVisualizer from './components/StackVisualizer'
import QueueVisualizer from './components/QueueVisualizer'

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
      case 'tree':
        return <TreeVisualizer onBack={() => setActiveVisualizer(null)} />;
      case 'linkedlist':
        return <LinkedListVisualizer onBack={() => setActiveVisualizer(null)} />;
      case 'stack':
        return <StackVisualizer onBack={() => setActiveVisualizer(null)} />;
      case 'queue':
        return <QueueVisualizer onBack={() => setActiveVisualizer(null)} />;
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
          onClick={() => handleActivate('tree')}
        >
          Tree Visualizer
        </button>
        <button 
          className="visualizer-btn"
          onClick={() => handleActivate('linkedlist')}
        >
          Linked List Visualizer
        </button>
        <button 
          className="visualizer-btn"
          onClick={() => handleActivate('stack')}
        >
          Stack Visualizer
        </button>
        <button 
          className="visualizer-btn"
          onClick={() => handleActivate('queue')}
        >
          Queue Visualizer
        </button>
      </div>
    </div>
  );
}

export default App

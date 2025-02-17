import React, { useState, useRef, useEffect } from 'react';
import './heapVisualizer.css';

const HeapVisualizer = ({ onBack }) => {
  const [nodes, setNodes] = useState([]);
  const [heapType, setHeapType] = useState('max'); // 'max' or 'min'
  const [inputValue, setInputValue] = useState(''); // New state for input value
  const treeAreaRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const LEVEL_HEIGHT = 120;

  const heapify = (array, i, heapSize) => {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let largest = i;

    if (heapType === 'max') {
      if (left < heapSize && parseInt(array[left].label) > parseInt(array[largest].label)) {
        largest = left;
      }
      if (right < heapSize && parseInt(array[right].label) > parseInt(array[largest].label)) {
        largest = right;
      }
    } else {
      if (left < heapSize && parseInt(array[left].label) < parseInt(array[largest].label)) {
        largest = left;
      }
      if (right < heapSize && parseInt(array[right].label) < parseInt(array[largest].label)) {
        largest = right;
      }
    }

    if (largest !== i) {
      // Swap values
      const temp = array[i].label;
      array[i].label = array[largest].label;
      array[largest].label = temp;
      
      heapify(array, largest, heapSize);
    }
  };

  const calculateNodePosition = (index) => {
    const level = Math.floor(Math.log2(index + 1));
    const offset = index - Math.pow(2, level) + 1;
    const totalNodesInLevel = Math.pow(2, level);
    const horizontalSpacing = window.innerWidth / (totalNodesInLevel + 1);
    
    return {
      x: (offset + 1) * horizontalSpacing,
      y: level * LEVEL_HEIGHT + 100
    };
  };

  const insertNode = (value) => {
    const newNodeIndex = nodes.length;
    const position = calculateNodePosition(newNodeIndex);

    const newNode = {
      id: `node-${newNodeIndex + 1}`,
      label: value.toString(),
      position: position
    };

    const newNodes = [...nodes, newNode];

    // Heapify up
    let current = newNodeIndex;
    while (current > 0) {
      const parentIndex = Math.floor((current - 1) / 2);
      const shouldSwap = heapType === 'max' 
        ? parseInt(newNodes[current].label) > parseInt(newNodes[parentIndex].label)
        : parseInt(newNodes[current].label) < parseInt(newNodes[parentIndex].label);

      if (shouldSwap) {
        // Swap labels only
        const temp = newNodes[current].label;
        newNodes[current].label = newNodes[parentIndex].label;
        newNodes[parentIndex].label = temp;
        current = parentIndex;
      } else {
        break;
      }
    }

    // Recalculate all node positions to ensure proper layout
    newNodes.forEach((node, index) => {
      node.position = calculateNodePosition(index);
    });

    setNodes(newNodes);
  };

  const deleteRoot = () => {
    if (nodes.length === 0) return;

    const newNodes = [...nodes];
    newNodes[0].label = newNodes[nodes.length - 1].label;
    newNodes.pop();
    
    heapify(newNodes, 0, newNodes.length);
    setNodes(newNodes);
  };

  // Canvas drag handlers
  const handleCanvasDragStart = (e) => {
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleCanvasDrag = (e) => {
    if (isDraggingCanvas) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleCanvasDragEnd = () => {
    setIsDraggingCanvas(false);
  };

  const handleInsert = (e) => {
    e.preventDefault(); // Prevent form submission
    if (inputValue.trim() === '') return;
    
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      alert('Please enter a valid number');
      return;
    }
    
    insertNode(value);
    setInputValue(''); // Clear input after insertion
  };

  // Initialize heap with root node
  useEffect(() => {
    const rootNode = {
      id: 'node-1',
      label: '50',
      position: { x: window.innerWidth / 2, y: 100 }
    };
    setNodes([rootNode]);
  }, []);

  return (
    <div className="heap-visualizer">
      <div className="heap-controls">
        <button className="heap-back-btn" onClick={onBack}>
          Back to Home
        </button>
        <button 
          className="heap-type-btn"
          onClick={() => setHeapType(prev => prev === 'max' ? 'min' : 'max')}
        >
          Switch to {heapType === 'max' ? 'Min' : 'Max'} Heap
        </button>
        <form onSubmit={handleInsert} className="heap-insert-form">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter value"
            className="heap-input"
          />
          <button 
            type="submit"
            className="heap-action-btn"
          >
            Insert
          </button>
        </form>
      </div>
      <div className="heap-area"
        ref={treeAreaRef}
        onMouseDown={handleCanvasDragStart}
        onMouseMove={handleCanvasDrag}
        onMouseUp={handleCanvasDragEnd}
        onMouseLeave={handleCanvasDragEnd}
      >
        <div className="heap-content" style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
        }}>
          {nodes.map((node, index) => {
            const parentIndex = Math.floor((index - 1) / 2);
            if (index > 0) {
              const parent = nodes[parentIndex];
              return (
                <React.Fragment key={`connection-${node.id}`}>
                  <div
                    className="heap-connection"
                    style={{
                      left: parent.position.x + 25,
                      top: parent.position.y + 25,
                      width: Math.sqrt(
                        Math.pow(node.position.x - parent.position.x, 2) +
                        Math.pow(node.position.y - parent.position.y, 2)
                      ),
                      transform: `rotate(${Math.atan2(
                        node.position.y - parent.position.y,
                        node.position.x - parent.position.x
                      )}rad)`
                    }}
                  />
                </React.Fragment>
              );
            }
            return null;
          })}
          {nodes.map(node => (
            <div
              key={node.id}
              className="heap-node"
              style={{
                left: node.position.x,
                top: node.position.y
              }}
            >
              {node.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeapVisualizer; 
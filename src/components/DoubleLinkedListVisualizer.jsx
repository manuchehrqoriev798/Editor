import React, { useState, useRef, useEffect } from 'react';
import './doubleLinkedListVisualizer.css';

const DoubleLinkedListVisualizer = ({ onBack }) => {
  const [nodes, setNodes] = useState([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const listAreaRef = useRef(null);

  useEffect(() => {
    // Create initial node
    const initialNode = {
      id: 'node-1',
      value: '1',
      position: {
        x: window.innerWidth / 2 - 40,
        y: window.innerHeight / 2 - 20
      }
    };
    setNodes([initialNode]);
  }, []);

  const addNode = (position = 'end') => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      value: (nodes.length + 1).toString(),
      position: calculateNewNodePosition(position)
    };

    if (position === 'start') {
      setNodes([newNode, ...nodes]);
    } else {
      setNodes([...nodes, newNode]);
    }
  };

  const calculateNewNodePosition = (position) => {
    if (nodes.length === 0) {
      return {
        x: window.innerWidth / 2 - 40,
        y: window.innerHeight / 2 - 20
      };
    }

    const lastNode = position === 'start' ? nodes[0] : nodes[nodes.length - 1];
    return {
      x: lastNode.position.x + (position === 'start' ? -120 : 120),
      y: lastNode.position.y
    };
  };

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
  };

  const handleNodeValueChange = (nodeId, newValue) => {
    setNodes(nodes.map(node =>
      node.id === nodeId ? { ...node, value: newValue } : node
    ));
  };

  // Canvas drag handlers
  const handleCanvasDragStart = (e) => {
    setIsDraggingCanvas(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    });
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

  // Zoom handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 4);
    setScale(newScale);
  };

  useEffect(() => {
    const listArea = listAreaRef.current;
    if (listArea) {
      listArea.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (listArea) {
        listArea.removeEventListener('wheel', handleWheel);
      }
    };
  }, [scale]);

  return (
    <div className="double-linked-list-visualizer">
      <div className="list-container">
        <div className="list-controls">
          <button className="back-btn" onClick={onBack}>
            Back to Home
          </button>
          <button onClick={() => addNode('start')}>Add to Start</button>
          <button onClick={() => addNode('end')}>Add to End</button>
        </div>
        <div className="list-area"
          ref={listAreaRef}
          onMouseDown={handleCanvasDragStart}
          onMouseMove={handleCanvasDrag}
          onMouseUp={handleCanvasDragEnd}
          onMouseLeave={handleCanvasDragEnd}
        >
          <div className="list-content" style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}>
            {nodes.map((node, index) => (
              <div key={node.id} className="list-node-container">
                <div
                  className="list-node"
                  style={{
                    left: node.position.x,
                    top: node.position.y
                  }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <input
                    type="text"
                    value={node.value}
                    onChange={(e) => handleNodeValueChange(node.id, e.target.value)}
                    className="node-input"
                  />
                  {hoveredNode === node.id && (
                    <button
                      className="delete-node-btn"
                      onClick={() => deleteNode(node.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
                {/* Forward arrows */}
                {index < nodes.length - 1 && (
                  <div className="list-arrow forward" style={{
                    left: node.position.x + 80,
                    top: node.position.y + 10
                  }}>
                    →
                  </div>
                )}
                {/* Backward arrows */}
                {index > 0 && (
                  <div className="list-arrow backward" style={{
                    left: node.position.x - 20,
                    top: node.position.y + 30
                  }}>
                    ←
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoubleLinkedListVisualizer; 
import React, { useState, useRef, useEffect } from 'react';
import './linkedListVisualizer.css';

const LinkedListVisualizer = ({ onBack }) => {
  const [nodes, setNodes] = useState([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredNodeContainer, setHoveredNodeContainer] = useState(null);
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

  const insertNode = (index, position) => {
    const referenceNode = nodes[index];
    const newNode = {
      id: `node-${Date.now()}`,
      value: '',
      position: {
        x: referenceNode.position.x + (position === 'before' ? -120 : 120),
        y: referenceNode.position.y
      }
    };

    const updatedNodes = [...nodes];
    const insertIndex = position === 'before' ? index : index + 1;
    updatedNodes.splice(insertIndex, 0, newNode);

    // Adjust positions of all subsequent nodes
    for (let i = insertIndex + 1; i < updatedNodes.length; i++) {
      updatedNodes[i] = {
        ...updatedNodes[i],
        position: {
          ...updatedNodes[i].position,
          x: updatedNodes[i - 1].position.x + 120
        }
      };
    }

    setNodes(updatedNodes);
  };

  const calculateConnectionStyle = (fromNode, toNode) => {
    const startX = fromNode.position.x + 25; // Half of node width
    const startY = fromNode.position.y + 25; // Half of node height
    const endX = toNode.position.x + 25;
    const endY = toNode.position.y + 25;

    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      left: startX,
      top: startY,
      width: length,
      transform: `rotate(${angle}deg)`
    };
  };

  return (
    <div className="linked-list-visualizer">
      <div className="list-container">
        <div className="list-controls">
          <button className="back-btn" onClick={onBack}>
            Back to Home
          </button>
          <button onClick={() => addNode('start')}>Add to Start</button>
          <button onClick={() => addNode('end')}>Add to End</button>
        </div>
        <div 
          className={`list-area ${isDraggingCanvas ? 'dragging' : ''}`}
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
              <div 
                key={node.id} 
                className="list-node-container"
                onMouseEnter={() => setHoveredNodeContainer(node.id)}
                onMouseLeave={(e) => {
                  // Check if we're not moving to one of the action buttons
                  const relatedTarget = e.relatedTarget;
                  if (!relatedTarget?.closest('.insert-node-btn') && 
                      !relatedTarget?.closest('.delete-node-btn')) {
                    setHoveredNodeContainer(null);
                  }
                }}
              >
                {index < nodes.length - 1 && (
                  <div 
                    className="list-connection"
                    style={calculateConnectionStyle(node, nodes[index + 1])}
                  />
                )}
                <div
                  className="list-node"
                  style={{
                    left: node.position.x,
                    top: node.position.y
                  }}
                >
                  <input
                    type="text"
                    value={node.value}
                    onChange={(e) => handleNodeValueChange(node.id, e.target.value)}
                    className="node-input"
                    placeholder="?"
                  />
                  {hoveredNodeContainer === node.id && (
                    <>
                      <button
                        className="delete-node-btn"
                        onClick={() => deleteNode(node.id)}
                        title="Delete node"
                        onMouseLeave={(e) => {
                          // Only hide if not moving to the node container
                          if (!e.relatedTarget?.closest('.list-node-container')) {
                            setHoveredNodeContainer(null);
                          }
                        }}
                      >
                        ×
                      </button>
                      <button
                        className="insert-node-btn left"
                        onClick={() => insertNode(index, 'before')}
                        title="Insert before"
                        onMouseLeave={(e) => {
                          if (!e.relatedTarget?.closest('.list-node-container')) {
                            setHoveredNodeContainer(null);
                          }
                        }}
                      >
                        +
                      </button>
                      <button
                        className="insert-node-btn right"
                        onClick={() => insertNode(index, 'after')}
                        title="Insert after"
                        onMouseLeave={(e) => {
                          if (!e.relatedTarget?.closest('.list-node-container')) {
                            setHoveredNodeContainer(null);
                          }
                        }}
                      >
                        +
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedListVisualizer;

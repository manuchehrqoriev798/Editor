import React, { useState, useRef, useEffect } from 'react';
import './linkedListVisualizer.css';

const LinkedListVisualizer = ({ onBack }) => {
  const [nodes, setNodes] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const listAreaRef = useRef(null);
  const [deletingNodes, setDeletingNodes] = useState(new Set());
  const [newNodeId, setNewNodeId] = useState(null);

  // Initialize with first node
  useEffect(() => {
    const initialNode = {
      id: `node-${Date.now()}`,
      label: '',
      position: {
        x: window.innerWidth / 2 - 20,
        y: window.innerHeight / 2 - 20,
      },
    };
    setNodes([initialNode]);
  }, []);

  const handleAddNode = (sourceNodeId, direction) => {
    const sourceNodeIndex = nodes.findIndex(node => node.id === sourceNodeId);
    const newNode = {
      id: `node-${Date.now()}`,
      label: '',
    };
    
    const newNodes = [...nodes];
    const insertIndex = direction === 'right' ? sourceNodeIndex + 1 : sourceNodeIndex;
    newNodes.splice(insertIndex, 0, newNode);
    
    setNodes(newNodes);
    setNewNodeId(newNode.id);
    setTimeout(() => setNewNodeId(null), 500);
  };

  const handleDeleteNode = (nodeId) => {
    setDeletingNodes(prev => new Set([...prev, nodeId]));

    setTimeout(() => {
      setNodes(nodes.filter(node => node.id !== nodeId));
      setHoveredNode(null);
      setDeletingNodes(prev => {
        const updated = new Set(prev);
        updated.delete(nodeId);
        return updated;
      });
    }, 300);
  };

  const handleLabelChange = (nodeId, newValue) => {
    setNodes(nodes.map(node =>
      node.id === nodeId ? { ...node, label: newValue } : node
    ));
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(4, prevScale + 0.1));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(0.1, prevScale - 0.1));
  };

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

  return (
    <div className="linked-list-visualizer">
      <div className="list-container">
        <div className="list-controls">
          <button className="back-btn" onClick={onBack}>
            Back to Home
          </button>
        </div>
        <div 
          className="list-area" 
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
            <div className="nodes-container">
              {nodes.map((node, index) => (
                <div
                  key={node.id}
                  className="node-wrapper"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div className={`node ${
                    newNodeId === node.id ? 'appear' : ''
                  } ${
                    deletingNodes.has(node.id) ? 'delete' : ''
                  } ${
                    hoveredNode === node.id ? 'node-hovered' : ''
                  }`}>
                    {hoveredNode === node.id && (
                      <>
                        <button 
                          className="add-node-btn left"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddNode(node.id, 'left');
                          }}
                        >
                          +
                        </button>
                        <button 
                          className="add-node-btn right"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddNode(node.id, 'right');
                          }}
                        >
                          +
                        </button>
                      </>
                    )}
                    <input
                      type="text"
                      value={node.label}
                      onChange={(e) => handleLabelChange(node.id, e.target.value)}
                      className="node-input"
                      placeholder="?"
                    />
                    {hoveredNode === node.id && (
                      <button 
                        className="delete-node-btn"
                        onClick={() => handleDeleteNode(node.id)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {index < nodes.length - 1 && (
                    <div className="connection-line">
                      <div className="arrow-head" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="zoom-controls">
            <button className="zoom-btn" onClick={handleZoomIn}>+</button>
            <div className="zoom-level">{Math.round(scale * 100)}%</div>
            <button className="zoom-btn" onClick={handleZoomOut}>−</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedListVisualizer;

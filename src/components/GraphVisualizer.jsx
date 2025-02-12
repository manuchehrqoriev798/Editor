import React, { useState, useRef, useEffect } from 'react';
import './graphVisualizer.css';

const GraphVisualizer = () => {
  const [isGraphCreated, setIsGraphCreated] = useState(false);
  const [nodes, setNodes] = useState([]);
  const graphAreaRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [connections, setConnections] = useState([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);

  const handleCreateGraph = () => {
    setIsGraphCreated(true);
    // Wait for the graph area to be rendered
    setTimeout(() => {
      // Add initial node in the center of the graph area
      const initialNode = {
        id: 'node-1',
        position: {
          x: graphAreaRef.current.clientWidth / 2 - 20, // 20 is half of node width
          y: graphAreaRef.current.clientHeight / 2 - 20, // 20 is half of node height
        },
      };
      setNodes([initialNode]);
    }, 0);
  };

  const handleAddNode = () => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      position: {
        x: Math.random() * (graphAreaRef.current.clientWidth - 100),
        y: Math.random() * (graphAreaRef.current.clientHeight - 100),
      },
    };
    setNodes([...nodes, newNode]);
  };

  // Add wheel event listener for zooming
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.1, scale + delta), 4);
      setScale(newScale);
    };

    const graphArea = graphAreaRef.current;
    if (graphArea) {
      graphArea.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (graphArea) {
        graphArea.removeEventListener('wheel', handleWheel);
      }
    };
  }, [scale]);

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setIsDraggingNode(true);
    setDraggedNode(nodeId);
  };

  const handleNodeMouseMove = (e) => {
    if (!isDraggingNode || !draggedNode) return;
    
    e.stopPropagation();
    const rect = graphAreaRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    setNodes(nodes.map(node => 
      node.id === draggedNode ? { ...node, position: { x, y } } : node
    ));
  };

  const handleNodeMouseUp = (e) => {
    e.stopPropagation();
    setIsDraggingNode(false);
    setDraggedNode(null);
  };

  const handleCanvasDragStart = (e) => {
    if (!isDraggingNode) {
      setIsDraggingCanvas(true);
      setDragStart({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      });
    }
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

  const addNodeInDirection = (sourceNode, direction) => {
    const spacing = 100;
    const alignmentThreshold = 20;
    let newPosition = { x: sourceNode.position.x, y: sourceNode.position.y };
    
    // Helper function to check if position is occupied
    const isPositionOccupied = (x, y) => {
      const occupiedThreshold = 20;
      return nodes.some(node => 
        Math.abs(node.position.x - x) < occupiedThreshold && 
        Math.abs(node.position.y - y) < occupiedThreshold
      );
    };

    // Find the next available position in the given direction
    const findNextAvailablePosition = (startX, startY, direction) => {
      let x = startX;
      let y = startY;
      let attempts = 0;
      const maxAttempts = 10;

      while (isPositionOccupied(x, y) && attempts < maxAttempts) {
        switch (direction) {
          case 'right': x += spacing; break;
          case 'left': x -= spacing; break;
          case 'bottom': y += spacing; break;
          case 'top': y -= spacing; break;
        }
        attempts++;
      }
      return { x, y };
    };

    // Calculate the initial position for the new node
    switch (direction) {
      case 'left': newPosition.x -= spacing; break;
      case 'right': newPosition.x += spacing; break;
      case 'top': newPosition.y -= spacing; break;
      case 'bottom': newPosition.y += spacing; break;
    }

    // Find the next available position if the initial position is occupied
    newPosition = findNextAvailablePosition(newPosition.x, newPosition.y, direction);

    const newNode = {
      id: `node-${nodes.length + 1}`,
      position: newPosition,
    };
    
    // Create a direct connection between source node and new node
    const newConnection = {
      from: sourceNode.id,
      to: newNode.id,
    };

    setNodes([...nodes, newNode]);
    setConnections([...connections, newConnection]);
  };

  const calculateLineProperties = (fromNode, toNode) => {
    // Calculate center points of nodes
    const fromX = fromNode.position.x + 20;
    const fromY = fromNode.position.y + 20;
    const toX = toNode.position.x + 20;
    const toY = toNode.position.y + 20;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Adjust length to not overlap with nodes
    const nodeRadius = 20; // Half of node width
    const adjustedLength = length - (2 * nodeRadius);
    
    return {
      left: fromX,
      top: fromY,
      width: adjustedLength,
      transform: `rotate(${angle}deg)`,
    };
  };

  const handleNodeClick = (e, nodeId) => {
    e.stopPropagation();
    setHoveredNode(nodeId === hoveredNode ? null : nodeId);
  };

  const handleGraphAreaClick = () => {
    setHoveredNode(null);
  };

  return (
    <div className="graph-visualizer">
      {!isGraphCreated ? (
        <button className="create-graph-btn" onClick={handleCreateGraph}>
          Create Graph
        </button>
      ) : (
        <div className="graph-container">
          <div 
            className="graph-area" 
            ref={graphAreaRef}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleGraphAreaClick}
            onMouseDown={handleCanvasDragStart}
            onMouseMove={(e) => {
              if (isDraggingNode) {
                handleNodeMouseMove(e);
              } else {
                handleCanvasDrag(e);
              }
            }}
            onMouseUp={(e) => {
              if (isDraggingNode) {
                handleNodeMouseUp(e);
              } else {
                handleCanvasDragEnd();
              }
            }}
            onMouseLeave={(e) => {
              if (isDraggingNode) {
                handleNodeMouseUp(e);
              } else {
                handleCanvasDragEnd();
              }
            }}
            style={{
              cursor: isDraggingCanvas ? 'grabbing' : 'grab'
            }}
          >
            <div className="graph-content" style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: '0 0'
            }}>
              {connections.map((connection, index) => {
                const fromNode = nodes.find(node => node.id === connection.from);
                const toNode = nodes.find(node => node.id === connection.to);
                if (!fromNode || !toNode) return null;

                const lineProps = calculateLineProperties(fromNode, toNode);

                return (
                  <div
                    key={`connection-${index}`}
                    className="connection-line"
                    style={{
                      left: `${lineProps.left}px`,
                      top: `${lineProps.top}px`,
                      width: `${lineProps.width}px`,
                      transform: lineProps.transform,
                    }}
                  >
                    <div className="arrow-head" />
                  </div>
                );
              })}
              {nodes.map((node, index) => (
                <div
                  key={node.id}
                  className="node-wrapper"
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div
                    className="node"
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    style={{
                      left: `${node.position.x}px`,
                      top: `${node.position.y}px`,
                      cursor: isDraggingNode ? 'grabbing' : 'grab'
                    }}
                  >
                    {index + 1}
                  </div>
                  {hoveredNode === node.id && (
                    <div className="add-buttons-container" style={{
                      left: `${node.position.x - 30}px`,
                      top: `${node.position.y - 30}px`,
                    }}>
                      <button 
                        className="add-node-btn left"
                        onClick={(e) => {
                          e.stopPropagation();
                          addNodeInDirection(node, 'left');
                        }}
                      >
                        +
                      </button>
                      <button 
                        className="add-node-btn right"
                        onClick={(e) => {
                          e.stopPropagation();
                          addNodeInDirection(node, 'right');
                        }}
                      >
                        +
                      </button>
                      <button 
                        className="add-node-btn top"
                        onClick={(e) => {
                          e.stopPropagation();
                          addNodeInDirection(node, 'top');
                        }}
                      >
                        +
                      </button>
                      <button 
                        className="add-node-btn bottom"
                        onClick={(e) => {
                          e.stopPropagation();
                          addNodeInDirection(node, 'bottom');
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphVisualizer;

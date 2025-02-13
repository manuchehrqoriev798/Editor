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
  const [addButtonPosition, setAddButtonPosition] = useState(null);
  const [cursorAngle, setCursorAngle] = useState(0);
  const NODE_RADIUS = 20; // Half of node width
  const INTERACTION_RADIUS = 40; // Distance from node edge where interaction is allowed

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

  const handleNodeMouseMove = (e, nodeId) => {
    if (isDraggingNode) {
      if (!draggedNode || !isDraggingNode) return;
      e.stopPropagation();
      const rect = graphAreaRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - offset.x) / scale;
      const y = (e.clientY - rect.top - offset.y) / scale;

      setNodes(nodes.map(node => 
        node.id === draggedNode ? { ...node, position: { x, y } } : node
      ));
    } else {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      const rect = graphAreaRef.current.getBoundingClientRect();
      const cursorX = (e.clientX - rect.left - offset.x) / scale;
      const cursorY = (e.clientY - rect.top - offset.y) / scale;

      const nodeCenter = {
        x: node.position.x + NODE_RADIUS,
        y: node.position.y + NODE_RADIUS
      };

      // Calculate distance from cursor to node center
      const dx = cursorX - nodeCenter.x;
      const dy = cursorY - nodeCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only show add button if cursor is between node edge and interaction radius
      if (distance > NODE_RADIUS && distance <= NODE_RADIUS + INTERACTION_RADIUS) {
        const angle = Math.atan2(dy, dx);
        setCursorAngle(angle);
        setAddButtonPosition({
          x: cursorX - 10,
          y: cursorY - 10
        });
        setHoveredNode(nodeId);
      } else {
        setAddButtonPosition(null);
      }
    }
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

  const addNodeAtAngle = (sourceNode, angle) => {
    const spacing = 100; // Distance from source node
    
    // Calculate initial position using trigonometry
    const initialPosition = {
      x: sourceNode.position.x + spacing * Math.cos(angle),
      y: sourceNode.position.y + spacing * Math.sin(angle)
    };

    // Helper function to check if position is occupied
    const isPositionOccupied = (x, y) => {
      const occupiedThreshold = 50; // Increased threshold for better spacing
      return nodes.some(node => 
        Math.sqrt(
          Math.pow(node.position.x - x, 2) + 
          Math.pow(node.position.y - y, 2)
        ) < occupiedThreshold
      );
    };

    let newPosition = initialPosition;
    
    // If initial position is occupied, try finding a free spot
    if (isPositionOccupied(initialPosition.x, initialPosition.y)) {
      let currentSpacing = spacing;
      const maxAttempts = 20;
      
      for (let i = 0; i < maxAttempts; i++) {
        currentSpacing += 60;
        const adjustedPosition = {
          x: sourceNode.position.x + currentSpacing * Math.cos(angle),
          y: sourceNode.position.y + currentSpacing * Math.sin(angle)
        };
        
        if (!isPositionOccupied(adjustedPosition.x, adjustedPosition.y)) {
          newPosition = adjustedPosition;
          break;
        }
      }
    }

    const newNode = {
      id: `node-${nodes.length + 1}`,
      position: newPosition,
    };
    
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
                handleNodeMouseMove(e, draggedNode);
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
              cursor: isDraggingCanvas ? 'grabbing' : 'default'
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
                  style={{
                    left: `${node.position.x + NODE_RADIUS}px`,
                    top: `${node.position.y + NODE_RADIUS}px`
                  }}
                  onMouseMove={(e) => handleNodeMouseMove(e, node.id)}
                  onMouseLeave={() => {
                    setAddButtonPosition(null);
                    setHoveredNode(null);
                  }}
                >
                  <div
                    className={`node ${hoveredNode === node.id ? 'node-hovered' : ''}`}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    style={{
                      left: `-${NODE_RADIUS}px`,
                      top: `-${NODE_RADIUS}px`,
                      cursor: isDraggingNode && draggedNode === node.id ? 'grabbing' : 'default'
                    }}
                  >
                    {index + 1}
                  </div>
                  {hoveredNode === node.id && addButtonPosition && (
                    <button 
                      className="add-node-btn"
                      style={{
                        left: `${addButtonPosition.x - node.position.x - NODE_RADIUS}px`,
                        top: `${addButtonPosition.y - node.position.y - NODE_RADIUS}px`,
                        position: 'absolute'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addNodeAtAngle(node, cursorAngle);
                      }}
                    >
                      +
                    </button>
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

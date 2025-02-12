import React, { useState, useRef } from 'react';
import './graphVisualizer.css';

const GraphVisualizer = () => {
  const [isGraphCreated, setIsGraphCreated] = useState(false);
  const [nodes, setNodes] = useState([]);
  const graphAreaRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [connections, setConnections] = useState([]);

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

  const handleDragStart = (e, nodeId) => {
    e.dataTransfer.setData('nodeId', nodeId);
  };

  const handleDrag = (e, nodeId) => {
    e.preventDefault();
  };

  const handleDrop = (e, nodeId) => {
    e.preventDefault();
    const rect = graphAreaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, position: { x, y } } : node
    ));
  };

  const addNodeInDirection = (sourceNode, direction) => {
    const spacing = 100;
    let newPosition = { x: sourceNode.position.x, y: sourceNode.position.y };
    
    // First, shift existing nodes that would be in the way
    const updatedNodes = nodes.map(node => {
      const shiftedNode = { ...node };
      
      switch (direction) {
        case 'right':
          if (node.position.x >= sourceNode.position.x + spacing) {
            shiftedNode.position = {
              ...node.position,
              x: node.position.x + spacing
            };
          }
          break;
        case 'left':
          if (node.position.x <= sourceNode.position.x - spacing) {
            shiftedNode.position = {
              ...node.position,
              x: node.position.x - spacing
            };
          }
          break;
        case 'bottom':
          if (node.position.y >= sourceNode.position.y + spacing) {
            shiftedNode.position = {
              ...node.position,
              y: node.position.y + spacing
            };
          }
          break;
        case 'top':
          if (node.position.y <= sourceNode.position.y - spacing) {
            shiftedNode.position = {
              ...node.position,
              y: node.position.y - spacing
            };
          }
          break;
      }
      return shiftedNode;
    });

    // Then calculate the position for the new node
    switch (direction) {
      case 'left':
        newPosition.x -= spacing;
        break;
      case 'right':
        newPosition.x += spacing;
        break;
      case 'top':
        newPosition.y -= spacing;
        break;
      case 'bottom':
        newPosition.y += spacing;
        break;
      default:
        break;
    }

    const newNode = {
      id: `node-${nodes.length + 1}`,
      position: newPosition,
    };
    
    const newConnection = {
      from: sourceNode.id,
      to: newNode.id,
    };

    setNodes([...updatedNodes, newNode]);
    setConnections([...connections, newConnection]);
  };

  const calculateLineProperties = (fromNode, toNode) => {
    const dx = toNode.position.x - fromNode.position.x;
    const dy = toNode.position.y - fromNode.position.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    return {
      left: fromNode.position.x + 20, // Add 20 to center of node
      top: fromNode.position.y + 20,
      width: length,
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
          >
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
                  draggable
                  onDragStart={(e) => handleDragStart(e, node.id)}
                  onDrag={(e) => handleDrag(e, node.id)}
                  onDragEnd={(e) => handleDrop(e, node.id)}
                  style={{
                    left: `${node.position.x}px`,
                    top: `${node.position.y}px`,
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
      )}
    </div>
  );
};

export default GraphVisualizer;

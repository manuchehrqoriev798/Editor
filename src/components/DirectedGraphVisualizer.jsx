import React, { useState, useRef, useEffect } from 'react';
import './directedGraphVisualizer.css';

const DirectedGraphVisualizer = ({ onActivate }) => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isGraphCreated, setIsGraphCreated] = useState(false);
  const graphAreaRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [cycles, setCycles] = useState(new Set());

  const handleCreateGraph = () => {
    setIsGraphCreated(true);
    onActivate();
    const initialNode = {
      id: 'node-1',
      label: '1',
      position: {
        x: window.innerWidth / 2 - 30,
        y: window.innerHeight / 2 - 30
      }
    };
    setNodes([initialNode]);
  };

  const detectCycles = () => {
    const visited = new Set();
    const recursionStack = new Set();
    const newCycles = new Set();

    const dfs = (nodeId) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingConnections = connections.filter(conn => conn.from === nodeId);
      for (const conn of outgoingConnections) {
        if (!visited.has(conn.to)) {
          if (dfs(conn.to)) {
            newCycles.add(conn.id);
          }
        } else if (recursionStack.has(conn.to)) {
          newCycles.add(conn.id);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id);
      }
    });

    setCycles(newCycles);
  };

  useEffect(() => {
    detectCycles();
  }, [connections]);

  const handleNodeDragStart = (e, nodeId) => {
    e.stopPropagation();
    setIsDraggingNode(true);
    setDraggedNode(nodeId);
  };

  const handleNodeDrag = (e) => {
    if (!isDraggingNode || !draggedNode) return;

    const rect = graphAreaRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    setNodes(nodes.map(node =>
      node.id === draggedNode
        ? { ...node, position: { x, y } }
        : node
    ));
  };

  const handleNodeDragEnd = () => {
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

  const addNode = (x, y) => {
    const newNode = {
      id: `node-${nodes.length + 1}`,
      label: (nodes.length + 1).toString(),
      position: { x, y }
    };
    setNodes([...nodes, newNode]);
  };

  const startConnection = (nodeId) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
  };

  const completeConnection = (toNodeId) => {
    if (connectingFrom && connectingFrom !== toNodeId) {
      const newConnection = {
        id: `conn-${connections.length + 1}`,
        from: connectingFrom,
        to: toNodeId
      };
      setConnections([...connections, newConnection]);
    }
    setIsConnecting(false);
    setConnectingFrom(null);
  };

  const calculateConnectionPath = (fromNode, toNode) => {
    const startX = fromNode.position.x + 30;
    const startY = fromNode.position.y + 30;
    const endX = toNode.position.x + 30;
    const endY = toNode.position.y + 30;

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
    <div className="directed-graph-visualizer">
      {!isGraphCreated ? (
        <button className="graph-control-btn" onClick={handleCreateGraph}>
          Create Graph
        </button>
      ) : (
        <div className="graph-area"
          ref={graphAreaRef}
          onMouseDown={handleCanvasDragStart}
          onMouseMove={(e) => {
            if (isDraggingNode) {
              handleNodeDrag(e);
            } else {
              handleCanvasDrag(e);
            }
          }}
          onMouseUp={handleCanvasDragEnd}
          onMouseLeave={handleCanvasDragEnd}
          onDoubleClick={(e) => {
            const rect = graphAreaRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - offset.x) / scale;
            const y = (e.clientY - rect.top - offset.y) / scale;
            addNode(x, y);
          }}
        >
          <div className="graph-content" style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}>
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const path = calculateConnectionPath(fromNode, toNode);
              return (
                <div
                  key={conn.id}
                  className={`graph-connection ${cycles.has(conn.id) ? 'cycle' : ''}`}
                  style={path}
                >
                  <div className="connection-arrow" />
                </div>
              );
            })}
            {nodes.map(node => (
              <div
                key={node.id}
                className="graph-node"
                style={{
                  left: node.position.x,
                  top: node.position.y,
                  cursor: isDraggingNode && draggedNode === node.id ? 'grabbing' : 'grab'
                }}
                onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  if (isConnecting) {
                    completeConnection(node.id);
                  }
                }}
              >
                {node.label}
                {hoveredNode === node.id && !isConnecting && (
                  <button
                    className="connection-handle"
                    onClick={(e) => {
                      e.stopPropagation();
                      startConnection(node.id);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectedGraphVisualizer; 
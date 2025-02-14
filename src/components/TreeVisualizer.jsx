import React, { useState, useRef, useEffect } from 'react';
import './treeVisualizer.css';

const TreeVisualizer = ({ onActivate }) => {
  const [nodes, setNodes] = useState([]);
  const [isTreeCreated, setIsTreeCreated] = useState(false);
  const treeAreaRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const LEVEL_HEIGHT = 120;
  const NODE_WIDTH = 50;

  const handleCreateTree = () => {
    setIsTreeCreated(true);
    onActivate();
    // Create root node
    const rootNode = {
      id: 'node-1',
      label: '1',
      level: 0,
      position: {
        x: window.innerWidth / 2 - 25,
        y: 60
      },
      isRoot: true,
      parentId: null,
      leftChildId: null,
      rightChildId: null
    };
    setNodes([rootNode]);
  };

  const calculateNodePosition = (parentNode, isLeft) => {
    const level = parentNode.level + 1;
    const horizontalSpacing = Math.max(200 / (level + 1), 80); // Decrease spacing for deeper levels
    
    return {
      x: parentNode.position.x + (isLeft ? -horizontalSpacing : horizontalSpacing),
      y: parentNode.position.y + LEVEL_HEIGHT
    };
  };

  const addChild = (parentId, isLeft) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    // Check if the slot is already taken
    if (isLeft && parent.leftChildId) return;
    if (!isLeft && parent.rightChildId) return;

    const newPosition = calculateNodePosition(parent, isLeft);
    const newNode = {
      id: `node-${nodes.length + 1}`,
      label: (nodes.length + 1).toString(),
      level: parent.level + 1,
      position: newPosition,
      isRoot: false,
      parentId: parentId,
      leftChildId: null,
      rightChildId: null
    };

    // Update parent's child references
    const updatedParent = {
      ...parent,
      [isLeft ? 'leftChildId' : 'rightChildId']: newNode.id
    };

    setNodes([
      ...nodes.filter(n => n.id !== parentId),
      updatedParent,
      newNode
    ]);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 4);
    setScale(newScale);
  };

  useEffect(() => {
    const treeArea = treeAreaRef.current;
    if (treeArea) {
      treeArea.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (treeArea) {
        treeArea.removeEventListener('wheel', handleWheel);
      }
    };
  }, [scale]);

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

  const calculateConnectionPath = (parentNode, childNode) => {
    const startX = parentNode.position.x + NODE_WIDTH / 2;
    const startY = parentNode.position.y + NODE_WIDTH / 2;
    const endX = childNode.position.x + NODE_WIDTH / 2;
    const endY = childNode.position.y + NODE_WIDTH / 2;

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
    <div className="tree-visualizer">
      {!isTreeCreated ? (
        <button className="tree-control-btn" onClick={handleCreateTree}>
          Create Tree
        </button>
      ) : (
        <div className="tree-area" 
          ref={treeAreaRef}
          onMouseDown={handleCanvasDragStart}
          onMouseMove={handleCanvasDrag}
          onMouseUp={handleCanvasDragEnd}
          onMouseLeave={handleCanvasDragEnd}
        >
          <div className="tree-content" style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}>
            {nodes.map(node => {
              const parent = nodes.find(n => n.id === node.parentId);
              return parent ? (
                <div
                  key={`connection-${node.id}`}
                  className="tree-connection"
                  style={calculateConnectionPath(parent, node)}
                />
              ) : null;
            })}
            {nodes.map(node => (
              <div
                key={node.id}
                className={`tree-node ${node.isRoot ? 'root' : ''}`}
                style={{
                  left: node.position.x,
                  top: node.position.y
                }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {node.label}
                {hoveredNode === node.id && (
                  <>
                    {!node.leftChildId && (
                      <button
                        className="add-child-btn left"
                        onClick={() => addChild(node.id, true)}
                      >
                        +
                      </button>
                    )}
                    {!node.rightChildId && (
                      <button
                        className="add-child-btn right"
                        onClick={() => addChild(node.id, false)}
                      >
                        +
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeVisualizer; 
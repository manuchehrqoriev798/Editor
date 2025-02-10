import { useState, useEffect } from 'react'
import './linkedlistvisualizer.css'
import React from 'react'

export default function LinkedListVisualizer() {
    const [lists, setLists] = useState([]);
    const [position, setPosition] = useState({ x: 200, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [draggedInfo, setDraggedInfo] = useState(null); // { listIndex, nodeIndex }
    const [editingInfo, setEditingInfo] = useState(null); // { listIndex, nodeIndex }
    const [inputValue, setInputValue] = useState('');
    const [showDirections, setShowDirections] = useState({ listIndex: null, nodeIndex: null });
    const nodeRefs = React.useRef({});

    const generateColor = (index) => {
        const goldenRatio = 0.618033988749895;
        const hue = (index * goldenRatio * 360) % 360;
        return `hsl(${hue}, 100%, 80%)`;
    }

    const createNewList = () => {
        setLists([...lists, [{ value: 1, next: null, originalIndex: 0 }]]);
    };

    const addNode = (listIndex, nodeIndex, direction) => {
        const newLists = [...lists];
        const maxOriginalIndex = Math.max(...newLists[listIndex].map(node => node.originalIndex)) + 1;
        const newNode = { 
            value: nodeIndex !== null ? lists[listIndex][nodeIndex].value + 1 : 1, 
            next: null,
            originalIndex: maxOriginalIndex
        };
        
        if (nodeIndex === null) {
            if (direction === 'right') {
                newNode.next = 0;
                newLists[listIndex].unshift(newNode);
            } else {
                newLists[listIndex].push(newNode);
            }
        } else {
            if (direction === 'right') {
                newLists[listIndex].splice(nodeIndex + 1, 0, newNode);
            } else {
                newLists[listIndex].splice(nodeIndex, 0, newNode);
            }
        }

        // Update next pointers
        newLists[listIndex].forEach((node, i) => {
            node.next = i < newLists[listIndex].length - 1 ? i + 1 : null;
        });

        setLists(newLists);
        setShowDirections({ listIndex: null, nodeIndex: null });
        
        // Force a rerender after a short delay
        setTimeout(() => {
            setLists([...newLists]);
        }, 50);
    };

    const removeNode = (listIndex, nodeIndex) => {
        const newLists = [...lists];
        newLists[listIndex] = newLists[listIndex].filter((_, i) => i !== nodeIndex);
        
        // Remove empty lists
        if (newLists[listIndex].length === 0) {
            newLists.splice(listIndex, 1);
        } else {
            // Update next pointers
            newLists[listIndex].forEach((node, i) => {
                node.next = i < newLists[listIndex].length - 1 ? i + 1 : null;
            });
        }
        
        setLists(newLists);
    };

    // Window dragging handlers
    const handleMouseDown = (e) => {
        if (e.target.classList.contains('node-box')) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            const elementWidth = 600;
            const elementHeight = 400;
            
            setPosition({
                x: Math.max(0, Math.min(window.innerWidth - elementWidth, newX)),
                y: Math.max(0, Math.min(window.innerHeight - elementHeight, newY))
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Node dragging handlers
    const handleNodeDragStart = (e, listIndex, nodeIndex) => {
        e.stopPropagation();
        setDraggedInfo({ listIndex, nodeIndex });
        e.target.classList.add('dragging');
    };

    const handleNodeDragOver = (e, listIndex, nodeIndex) => {
        e.preventDefault();
        if (!draggedInfo) return;
        
        const newLists = [...lists];
        const sourceList = newLists[draggedInfo.listIndex];
        const draggedNode = { ...sourceList[draggedInfo.nodeIndex] };
        
        // Remove from source
        sourceList.splice(draggedInfo.nodeIndex, 1);
        
        // Add to target
        newLists[listIndex].splice(nodeIndex, 0, draggedNode);
        
        // Update next pointers for both lists
        sourceList.forEach((node, i) => {
            node.next = i < sourceList.length - 1 ? i + 1 : null;
        });
        
        newLists[listIndex].forEach((node, i) => {
            node.next = i < newLists[listIndex].length - 1 ? i + 1 : null;
        });
        
        setLists(newLists);
        setDraggedInfo({ listIndex, nodeIndex });
    };

    const handleNodeDragEnd = (e) => {
        e.target.classList.remove('dragging');
        setDraggedInfo(null);
    };

    const handleInputSubmit = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            const newLists = [...lists];
            newLists[editingInfo.listIndex][editingInfo.nodeIndex].value = Number(inputValue);
            setLists(newLists);
            setEditingInfo(null);
            setInputValue('');
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    }, [isDragging, dragStart]);

    const NodeConnector = ({ startNode, endNode, listKey }) => {
        const [dimensions, setDimensions] = useState({ width: 0, angle: 0, left: 0, top: 0 });
        const [forceUpdate, setForceUpdate] = useState(0);

        useEffect(() => {
            const updateDimensions = () => {
                if (!startNode || !endNode) return;

                requestAnimationFrame(() => {
                    const start = startNode.getBoundingClientRect();
                    const end = endNode.getBoundingClientRect();
                    
                    const dx = end.left - start.right;
                    const dy = end.top - start.top;
                    
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    setDimensions({
                        width: length,
                        angle: angle,
                        left: start.right - start.left,
                        top: start.height / 2
                    });
                });
            };

            // Initial updates
            updateDimensions();
            const timer1 = setTimeout(updateDimensions, 0);
            const timer2 = setTimeout(updateDimensions, 100);

            const resizeObserver = new ResizeObserver(() => {
                updateDimensions();
                // Force another update after a short delay
                setTimeout(updateDimensions, 50);
            });

            if (startNode) resizeObserver.observe(startNode);
            if (endNode) resizeObserver.observe(endNode);

            // Force periodic updates for a short time after mounting
            const interval = setInterval(() => {
                setForceUpdate(prev => prev + 1);
            }, 100);

            setTimeout(() => clearInterval(interval), 500);

            window.addEventListener('resize', updateDimensions);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                resizeObserver.disconnect();
                window.removeEventListener('resize', updateDimensions);
                clearInterval(interval);
            };
        }, [startNode, endNode, listKey, forceUpdate]);

        if (!startNode || !endNode) return null;

        return (
            <div 
                className="node-connector"
                style={{
                    width: `${dimensions.width}px`,
                    transform: `rotate(${dimensions.angle}deg)`,
                    left: dimensions.left + 'px',
                    top: dimensions.top + 'px'
                }}
            />
        );
    };

    return (
        <>
            <div className='window'
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    position: 'absolute',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                }}
                onMouseDown={handleMouseDown}
            >
                <div className='linkedlist-container'>
                    {lists.map((list, listIndex) => (
                        <div key={listIndex} className='list-wrapper'>
                            <div className='nodes-container'>
                                {/* Start of list insert point */}
                                <div 
                                    className="insert-point start-insert"
                                    onMouseEnter={() => setShowDirections({ listIndex, nodeIndex: null })}
                                    onMouseLeave={() => setShowDirections({ listIndex: null, nodeIndex: null })}
                                >
                                    {showDirections.listIndex === listIndex && showDirections.nodeIndex === null && (
                                        <div className="direction-buttons">
                                            <button onClick={() => addNode(listIndex, null, 'left')}>←</button>
                                            <button onClick={() => addNode(listIndex, null, 'right')}>→</button>
                                        </div>
                                    )}
                                </div>

                                {list.map((node, nodeIndex) => (
                                    <React.Fragment key={node.originalIndex}>
                                        <div className='node-wrapper'>
                                            <div className="direction-buttons">
                                                <button 
                                                    className="left-button"
                                                    onClick={() => addNode(listIndex, nodeIndex, 'left')}
                                                >
                                                    ←
                                                </button>
                                                <button 
                                                    className="right-button"
                                                    onClick={() => addNode(listIndex, nodeIndex, 'right')}
                                                >
                                                    →
                                                </button>
                                            </div>
                                            <div
                                                className='node-box'
                                                ref={el => {
                                                    if (el) {
                                                        nodeRefs.current[`${listIndex}-${nodeIndex}`] = el;
                                                    }
                                                }}
                                                draggable="true"
                                                onDragStart={(e) => handleNodeDragStart(e, listIndex, nodeIndex)}
                                                onDragOver={(e) => handleNodeDragOver(e, listIndex, nodeIndex)}
                                                onDragEnd={handleNodeDragEnd}
                                                style={{ backgroundColor: generateColor(node.originalIndex) }}
                                                onDoubleClick={() => {
                                                    setEditingInfo({ listIndex, nodeIndex });
                                                    setInputValue(node.value.toString());
                                                }}
                                            >
                                                {editingInfo?.listIndex === listIndex && editingInfo?.nodeIndex === nodeIndex ? (
                                                    <input
                                                        type="number"
                                                        value={inputValue}
                                                        onChange={(e) => setInputValue(e.target.value)}
                                                        onKeyDown={handleInputSubmit}
                                                        autoFocus
                                                    />
                                                ) : node.value}
                                                <button 
                                                    className="remove-button"
                                                    onClick={() => removeNode(listIndex, nodeIndex)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            {node.next !== null && (
                                                <NodeConnector 
                                                    startNode={nodeRefs.current[`${listIndex}-${nodeIndex}`]}
                                                    endNode={nodeRefs.current[`${listIndex}-${node.next}`]}
                                                    listKey={`${listIndex}-${list.length}`}
                                                />
                                            )}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={createNewList}>Create New List</button>
        </>
    )
} 
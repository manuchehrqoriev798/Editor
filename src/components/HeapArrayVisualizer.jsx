import React, { useState, useEffect } from 'react';
import './heapArrayVisualizer.css';

const HeapArrayVisualizer = () => {
  const [array, setArray] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);
  const [comparingIndices, setComparingIndices] = useState([]);
  const [swappingIndices, setSwappingIndices] = useState([]);
  const [isMinHeap, setIsMinHeap] = useState(true);

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleInputChange = (e) => {
    // Allow only numbers and commas
    const value = e.target.value.replace(/[^0-9,]/g, '');
    setInputValue(value);
  };

  const handleInsert = async () => {
    const values = inputValue.split(',')
      .map(v => v.trim())
      .filter(v => v !== '' && !isNaN(v))
      .map(v => parseInt(v));
    
    if (values.length === 0) return;

    let newArray = [...array];

    for (const value of values) {
      // Add new element to the end
      newArray.push(value);
      setArray([...newArray]);
      
      // Highlight the newly added element
      setActiveIndex(newArray.length - 1);
      await delay(500);
      
      let currentIndex = newArray.length - 1;
      
      // Keep moving up while parent exists and heap property is violated
      while (currentIndex > 0) {
        const parentIndex = Math.floor((currentIndex - 1) / 2);
        
        // Compare with parent
        setComparingIndices([currentIndex, parentIndex]);
        await delay(800);
        
        const shouldSwap = isMinHeap 
          ? newArray[currentIndex] < newArray[parentIndex]
          : newArray[currentIndex] > newArray[parentIndex];
        
        if (!shouldSwap) break;
        
        // Perform swap
        setSwappingIndices([currentIndex, parentIndex]);
        await delay(500);
        
        [newArray[currentIndex], newArray[parentIndex]] = 
        [newArray[parentIndex], newArray[currentIndex]];
        
        setArray([...newArray]);
        setSwappingIndices([]);
        await delay(300);
        
        currentIndex = parentIndex;
      }
      
      // Clear highlights
      setActiveIndex(null);
      setComparingIndices([]);
    }
    
    setInputValue('');
  };

  const handleClear = () => {
    setArray([]);
    setActiveIndex(null);
    setComparingIndices([]);
    setSwappingIndices([]);
  };

  const toggleHeapType = async () => {
    setIsMinHeap(!isMinHeap);
    if (array.length > 0) {
      const values = [...array];
      handleClear();
      await delay(300);
      
      // Rebuild heap with values
      let newArray = [];
      for (const value of values) {
        newArray.push(value);
        setArray([...newArray]);
        
        let currentIndex = newArray.length - 1;
        while (currentIndex > 0) {
          const parentIndex = Math.floor((currentIndex - 1) / 2);
          
          const shouldSwap = isMinHeap 
            ? newArray[currentIndex] < newArray[parentIndex]
            : newArray[currentIndex] > newArray[parentIndex];
          
          if (!shouldSwap) break;
          
          [newArray[currentIndex], newArray[parentIndex]] = 
          [newArray[parentIndex], newArray[currentIndex]];
          
          setArray([...newArray]);
          await delay(300);
          
          currentIndex = parentIndex;
        }
      }
    }
  };

  return (
    <div className="heap-array-container">
      <h2>Heap Array Visualizer ({isMinHeap ? 'Min Heap' : 'Max Heap'})</h2>
      
      <div className="heap-array-controls">
        <input
          type="text"
          className="heap-array-input"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter numbers (e.g., 5,3,8)"
        />
        <button className="heap-array-button" onClick={handleInsert}>Insert</button>
        <button className="heap-array-button" onClick={handleClear}>Clear</button>
        <button className="heap-array-button" onClick={toggleHeapType}>
          Toggle Heap Type
        </button>
      </div>

      <div className="heap-array-array-container">
        {array.map((value, index) => (
          <div
            key={index}
            className={`heap-array-element ${
              activeIndex === index ? 'heap-array-active' : ''
            } ${comparingIndices.includes(index) ? 'heap-array-comparing' : ''} ${
              swappingIndices.includes(index) ? 'heap-array-swapping' : ''
            }`}
          >
            {value}
            <div className="heap-array-index">[{index}]</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeapArrayVisualizer;

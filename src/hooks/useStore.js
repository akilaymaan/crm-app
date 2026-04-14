import { useState, useCallback } from 'react';

// Simple state management hook for CRUD operations
export function useCrudState(initialData) {
  const [items, setItems] = useState(initialData);

  const addItem = useCallback((item) => {
    setItems(prev => [...prev, { ...item, id: Date.now() }]);
  }, []);

  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const deleteItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return { items, setItems, addItem, updateItem, deleteItem };
}

// Toast notification helper
let toastId = 0;
export function createToast(message, type = 'success') {
  return { id: ++toastId, message, type, timestamp: Date.now() };
}

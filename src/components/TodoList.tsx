'use client';

import { useState, useEffect, useRef } from 'react';
import { TodoItem } from '../types';

function getInitialTodos(): TodoItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('todo-list');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>(getInitialTodos);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const isFirstRender = useRef(true);

  // Save to localStorage when todos change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('todo-list', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;

    const item: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
    };

    setTodos(prev => [...prev, item]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const startEditing = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const saveEdit = () => {
    if (!editingId || !editingText.trim()) {
      setEditingId(null);
      return;
    }
    setTodos(prev => prev.map(todo =>
      todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
    ));
    setEditingId(null);
  };

  const completedCount = todos.filter(t => t.completed).length;

  const clearCompleted = () => setTodos(prev => prev.filter(t => !t.completed));

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">
          Todo List
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({completedCount}/{todos.length} completed)
          </span>
        </h2>
        {completedCount > 0 && (
          <button
            onClick={clearCompleted}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Clear completed ({completedCount})
          </button>
        )}
      </div>

      {/* Add Todo Form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add new todo..."
          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={addTodo}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Todo Items */}
      <ul className="space-y-2">
        {todos.length === 0 ? (
          <li className="text-gray-500 text-center py-8">No todos yet. Add one above!</li>
        ) : (
          todos.map(todo => (
            <li
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg group"
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 text-green-500 rounded focus:ring-green-500 bg-gray-600 border-gray-500"
              />
              {editingId === todo.id ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={saveEdit}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  autoFocus
                  className="flex-1 px-1 py-0 bg-gray-600 border border-green-400 rounded text-white focus:outline-none"
                />
              ) : (
                <span
                  className={`flex-1 cursor-pointer ${todo.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}
                  onDoubleClick={() => startEditing(todo)}
                  title="Double-click to edit"
                >
                  {todo.text}
                </span>
              )}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

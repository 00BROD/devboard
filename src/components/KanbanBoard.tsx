'use client';

import { useState, useEffect, useRef, DragEvent } from 'react';
import { Task, KanbanColumn, Priority } from '../types';

const PRIORITY_STYLES: Record<Priority, string> = {
  high:   'bg-red-500/20 text-red-300 border border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  low:    'bg-green-500/20 text-green-300 border border-green-500/30',
};

const defaultColumns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', tasks: [] },
  { id: 'inprogress', title: 'In Progress', tasks: [] },
  { id: 'done', title: 'Done', tasks: [] },
];

function dueDateClass(date: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date + 'T00:00:00');
  const diff = d.getTime() - today.getTime();
  if (diff < 0) return 'text-red-400';
  if (diff <= 86400000) return 'text-yellow-400';
  return 'text-green-400';
}

interface Props {
  projectId: string;
}

export default function KanbanBoard({ projectId }: Props) {
  const storageKey = `kanban-${projectId}`;
  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    if (typeof window === 'undefined') return defaultColumns;
    try {
      const saved = localStorage.getItem(`kanban-${projectId}`);
      return saved ? JSON.parse(saved) : defaultColumns;
    } catch {
      return defaultColumns;
    }
  });
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [showDetails, setShowDetails] = useState(false);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColumnId: string } | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    localStorage.setItem(storageKey, JSON.stringify(columns));
  }, [columns, storageKey]);

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      priority: newPriority,
      ...(newDesc.trim() && { description: newDesc.trim() }),
      ...(newDue && { dueDate: newDue }),
    };
    setColumns(cols => cols.map(col =>
      col.id === 'todo' ? { ...col, tasks: [...col.tasks, task] } : col
    ));
    setNewTitle('');
    setNewDesc('');
    setNewDue('');
    setShowDetails(false);
  };

  const deleteTask = (columnId: string, taskId: string) => {
    setColumns(cols => cols.map(col =>
      col.id === columnId
        ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
        : col
    ));
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = () => {
    if (!editingTaskId || !editingTitle.trim()) { setEditingTaskId(null); return; }
    setColumns(cols => cols.map(col => ({
      ...col,
      tasks: col.tasks.map(t =>
        t.id === editingTaskId ? { ...t, title: editingTitle.trim() } : t
      ),
    })));
    setEditingTaskId(null);
  };

  const handleDragStart = (e: DragEvent, task: Task, columnId: string) => {
    setDraggedTask({ task, sourceColumnId: columnId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }
    setColumns(cols => cols.map(col => {
      if (col.id === draggedTask.sourceColumnId) return { ...col, tasks: col.tasks.filter(t => t.id !== draggedTask.task.id) };
      if (col.id === targetColumnId) return { ...col, tasks: [...col.tasks, draggedTask.task] };
      return col;
    }));
    setDraggedTask(null);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Kanban Board</h2>

      {/* Add Task Form */}
      <div className="mb-6 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add new task..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newPriority}
            onChange={e => setNewPriority(e.target.value as Priority)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={() => setShowDetails(v => !v)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 hover:text-white transition-colors text-sm whitespace-nowrap"
          >
            {showDetails ? '− Details' : '+ Details'}
          </button>
          <button
            onClick={addTask}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        {showDetails && (
          <div className="flex gap-2">
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Description (optional)..."
              rows={2}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400">Due date</label>
              <input
                type="date"
                value={newDue}
                onChange={e => setNewDue(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, column.id)}
            className="bg-gray-700 rounded-lg p-4 min-h-[300px]"
          >
            <h3 className="font-semibold text-gray-200 mb-3 pb-2 border-b border-gray-600">
              {column.title}
              <span className="ml-2 text-sm text-gray-400">({column.tasks.length})</span>
            </h3>
            <div className="space-y-2">
              {column.tasks.map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={e => handleDragStart(e, task, column.id)}
                  className="bg-gray-600 p-3 rounded shadow cursor-move hover:shadow-md transition-shadow group"
                >
                  <div className="flex justify-between items-start">
                    {editingTaskId === task.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={e => e.key === 'Enter' && saveEdit()}
                        autoFocus
                        className="flex-1 px-1 py-0 bg-gray-700 border border-blue-400 rounded text-white focus:outline-none"
                      />
                    ) : (
                      <span
                        className="text-gray-100 flex-1 cursor-pointer select-none"
                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                        onDoubleClick={() => startEditing(task)}
                        title="Click to expand · Double-click to edit"
                      >
                        {task.title}
                      </span>
                    )}
                    <button
                      onClick={() => deleteTask(column.id, task.id)}
                      className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>

                  {/* Priority + due date badges */}
                  {(task.priority || task.dueDate) && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {task.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className={`text-xs font-medium ${dueDateClass(task.dueDate)}`}>
                          due {task.dueDate}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expanded description */}
                  {expandedTaskId === task.id && task.description && (
                    <p className="mt-2 text-xs text-gray-400 border-t border-gray-500 pt-2 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

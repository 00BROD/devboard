'use client';

import { useState } from 'react';
import { Project } from '../types';

interface Props {
  projects: Project[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

export default function ProjectSelector({ projects, activeId, onSelect, onAdd, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-gray-500 text-sm font-medium">Projects:</span>
      {projects.map(p => (
        <div key={p.id} className="flex items-center gap-0.5">
          <button
            onClick={() => onSelect(p.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeId === p.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {p.name}
          </button>
          {projects.length > 1 && (
            <button
              onClick={() => onDelete(p.id)}
              title="Delete project"
              className="text-gray-600 hover:text-red-400 text-xs px-0.5 leading-none"
            >
              ×
            </button>
          )}
        </div>
      ))}
      {adding ? (
        <div className="flex gap-1 items-center">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setAdding(false); setNewName(''); }
            }}
            placeholder="Project name..."
            className="px-3 py-1 bg-gray-700 border border-blue-500 rounded-full text-sm text-white focus:outline-none w-36"
          />
          <button
            onClick={handleAdd}
            className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
          >
            Add
          </button>
          <button
            onClick={() => { setAdding(false); setNewName(''); }}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
        >
          + New Project
        </button>
      )}
    </div>
  );
}

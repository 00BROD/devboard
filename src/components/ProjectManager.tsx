'use client';

import { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import TodoList from './TodoList';
import ProjectSelector from './ProjectSelector';
import { Project } from '../types';

const DEFAULT: Project = { id: 'default', name: 'My Project' };
const STORAGE_PROJECTS = 'pm-projects';
const STORAGE_ACTIVE = 'pm-active';

function loadProjects(): Project[] {
  if (typeof window === 'undefined') return [DEFAULT];
  try {
    const saved = localStorage.getItem(STORAGE_PROJECTS);
    return saved ? JSON.parse(saved) : [DEFAULT];
  } catch {
    return [DEFAULT];
  }
}

function loadActiveId(): string {
  if (typeof window === 'undefined') return DEFAULT.id;
  return localStorage.getItem(STORAGE_ACTIVE) ?? DEFAULT.id;
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [activeId, setActiveId] = useState<string>(loadActiveId);

  const persist = (ps: Project[], aid: string) => {
    localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(ps));
    localStorage.setItem(STORAGE_ACTIVE, aid);
  };

  const addProject = (name: string) => {
    const id = `proj-${Date.now()}`;
    const updated = [...projects, { id, name }];
    setProjects(updated);
    setActiveId(id);
    persist(updated, id);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    if (!updated.length) return;
    const nextId = activeId === id ? updated[0].id : activeId;
    setProjects(updated);
    setActiveId(nextId);
    localStorage.removeItem(`kanban-${id}`);
    persist(updated, nextId);
  };

  const selectProject = (id: string) => {
    setActiveId(id);
    localStorage.setItem(STORAGE_ACTIVE, id);
  };

  return (
    <div className="space-y-6">
      <ProjectSelector
        projects={projects}
        activeId={activeId}
        onSelect={selectProject}
        onAdd={addProject}
        onDelete={deleteProject}
      />
      <KanbanBoard key={activeId} projectId={activeId} />
      <TodoList />
    </div>
  );
}

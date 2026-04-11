// Core types for the project management tool

export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string; // YYYY-MM-DD
}

export interface KanbanColumn {
  id: 'todo' | 'inprogress' | 'done';
  title: string;
  tasks: Task[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
}

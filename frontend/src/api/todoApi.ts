import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types/todo';

const API_BASE_URL = 'http://localhost:5000/api';

export const todoApi = {
  async getAll(): Promise<Todo[]> {
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  },

  async create(data: CreateTodoRequest): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create todo');
    return response.json();
  },

  async update(id: number, data: UpdateTodoRequest): Promise<Todo> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete todo');
  },
};

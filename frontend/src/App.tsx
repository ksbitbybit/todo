import { useState, useEffect } from 'react';
import type { Todo } from './types/todo';
import { todoApi } from './api/todoApi';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await todoApi.getAll();
      setTodos(data);
      setError(null);
    } catch {
      setError('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (title: string) => {
    try {
      const newTodo = await todoApi.create({ title });
      setTodos([newTodo, ...todos]);
    } catch {
      setError('Failed to create todo');
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    try {
      const updatedTodo = await todoApi.update(id, { completed });
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch {
      setError('Failed to update todo');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await todoApi.delete(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch {
      setError('Failed to delete todo');
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Todo App</h1>
        <TodoForm onSubmit={handleCreate} />
        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <p className="loading-message">Loading...</p>
        ) : (
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        <div className="stats">
          <span>{todos.filter((t) => !t.completed).length} tasks remaining</span>
        </div>
      </div>
    </div>
  );
}

export default App;

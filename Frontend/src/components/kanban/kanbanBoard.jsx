import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Calendar, Trash2, CheckSquare, Square } from 'lucide-react';

export default function KanbanBoard({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let res;
      try {
        res = await API.get(`/tasks/project/${projectId}`);
      } catch (e) {
        res = await API.get('/tasks');
      }
      setTasks(res.data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Toggle Task Completion (Checkbox)
  const handleToggleComplete = async (task) => {
    const isCompleted = task.status === 'Completed';
    const newStatus = isCompleted ? 'To Do' : 'Completed';

    // Optimistic UI update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );

    try {
      await API.put(`/tasks/${task._id}`, { status: newStatus });
    } catch (err) {
      console.error('Error toggling task completion:', err);
      fetchTasks(); // Revert on failure
    }
  };

  // 2. Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    // Optimistic UI removal
    setTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId));

    try {
      await API.delete(`/tasks/${taskId}`);
    } catch (err) {
      console.error('Error deleting task:', err);
      fetchTasks(); // Revert on failure
    }
  };

  // 3. Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetColumnTitle) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    // Optimistic UI update for smooth dragging
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === taskId ? { ...t, status: targetColumnTitle } : t))
    );

    try {
      await API.put(`/tasks/${taskId}`, { status: targetColumnTitle });
    } catch (err) {
      console.error('Error moving task:', err);
      fetchTasks(); // Revert on failure
    }
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (p === 'medium') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  };

  const filterTasks = (columnTitle) => {
    return tasks.filter((t) => {
      if (!t || !t.status) return columnTitle === 'To Do';
      const s = t.status.toString().toLowerCase().replace(/[\s_]+/g, '');
      const col = columnTitle.toLowerCase().replace(/[\s_]+/g, '');

      if (col === 'todo' && (s === 'todo' || s === 'to do')) return true;
      if (col === 'inprogress' && (s === 'inprogress' || s === 'in progress')) return true;
      if (col === 'review' && s === 'review') return true;
      if (col === 'completed' && (s === 'completed' || s === 'done')) return true;

      return s === col;
    });
  };

  const columns = [
    { title: 'To Do', color: 'border-blue-500' },
    { title: 'In Progress', color: 'border-yellow-500' },
    { title: 'Review', color: 'border-purple-500' },
    { title: 'Completed', color: 'border-green-500' }
  ];

  if (loading) {
    return <div className="text-gray-400 py-10 text-center">Loading board tasks...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {columns.map((col) => {
        const columnTasks = filterTasks(col.title);
        return (
          <div
            key={col.title}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.title)}
            className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex flex-col h-[70vh] transition-colors hover:border-slate-600/80"
          >
            {/* Column Header */}
            <div className={`flex justify-between items-center pb-3 mb-4 border-b-2 ${col.color}`}>
              <h3 className="font-bold text-white text-base">{col.title}</h3>
              <span className="bg-slate-700 text-gray-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                {columnTasks.length}
              </span>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {columnTasks.length > 0 ? (
                columnTasks.map((task, idx) => {
                  const isDone = task.status === 'Completed';
                  return (
                    <div
                      key={task._id || idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task._id)}
                      className={`bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-md cursor-grab active:cursor-grabbing hover:border-slate-500 transition space-y-3 ${
                        isDone ? 'opacity-60 bg-slate-800/50' : ''
                      }`}
                    >
                      {/* Top Bar: Title, Priority, Checkbox & Delete */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2 flex-1">
                          {/* Toggle Checkbox Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(task)}
                            className="text-indigo-400 hover:text-indigo-300 transition"
                            title={isDone ? 'Mark as To Do' : 'Mark as Completed'}
                          >
                            {isDone ? (
                              <CheckSquare className="h-4 w-4 text-green-400" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>

                          <h4
                            className={`font-semibold text-sm ${
                              isDone ? 'line-through text-gray-400' : 'text-white'
                            }`}
                          >
                            {task.title || 'Untitled Task'}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded border font-medium ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority || 'Low'}
                          </span>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-gray-400 hover:text-red-400 transition"
                            title="Delete Task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p
                          className={`text-xs line-clamp-2 ${
                            isDone ? 'line-through text-gray-500' : 'text-gray-400'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      {/* Footer: Due Date */}
                      <div className="flex items-center justify-between pt-2 text-xs text-gray-400 border-t border-slate-700/50">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : 'No date'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs border-2 border-dashed border-slate-700/50 rounded-lg">
                  Drag tasks here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
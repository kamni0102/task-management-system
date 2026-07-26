import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, MessageSquare, Trash2, Check } from 'lucide-react';

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Completed'];

export default function KanbanBoard({ tasks = [], onDragEnd, onTaskClick, onDeleteTask, onQuickComplete }) {
  const getPriorityBadge = (p) => {
    if (p === 'High') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (p === 'Medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col);
          return (
            <Droppable key={col} droppableId={col}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[500px]"
                >
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800/80">
                    <h3 className="font-semibold text-slate-200 text-sm tracking-wide">{col}</h3>
                    <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-medium">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.map((task, index) => (
                      <Draggable key={`${task._id}-${index}`} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick && onTaskClick(task)}
                            className={`border p-4 rounded-lg cursor-pointer space-y-3 transition group relative ${
                              task.status === 'Completed'
                                ? 'bg-slate-900/60 border-emerald-500/30 opacity-75'
                                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/50'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2">
                                {/* Green Tick Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickComplete(task._id);
                                  }}
                                  title={task.status === 'Completed' ? 'Completed' : 'Mark as Completed'}
                                  className={`p-1 rounded-full border transition flex items-center justify-center ${
                                    task.status === 'Completed'
                                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                      : 'border-slate-600 text-slate-400 hover:border-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </button>

                                <h4
                                  className={`font-medium text-sm line-clamp-1 transition ${
                                    task.status === 'Completed'
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-100 group-hover:text-indigo-400'
                                  }`}
                                >
                                  {task.title}
                                </h4>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                                  {task.priority}
                                </span>

                                {/* Delete Icon */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTask(task._id);
                                  }}
                                  title="Delete Task"
                                  className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-700/50 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {task.description && (
                              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pl-7">
                                {task.description}
                              </p>
                            )}

                            <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-700/40 pl-7">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                              </span>

                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3.5 h-3.5" />
                                {task.comments?.length || 0}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
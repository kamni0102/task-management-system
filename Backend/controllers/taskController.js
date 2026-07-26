const Task = require('../models/Task');
const Activity = require('../models/Activity');

// Fetch tasks for a project
const getTasksByProject = async (req, res) => {
  const { projectId } = req.params;
  const tasks = await Task.find({ project: projectId })
    .populate('assignees', 'name email')
    .populate('comments.user', 'name');
  res.json(tasks);
};

// Create a new task
const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, project, assignees, subtasks } = req.body;

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate,
    project,
    assignees,
    subtasks,
  });

  await Activity.create({
    project,
    user: req.user._id,
    action: 'created task',
    details: `Created task "${title}".`,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignees', 'name email')
    .populate('comments.user', 'name');

  // Emit socket event from req.app if needed
  req.io.to(project.toString()).emit('taskCreated', populatedTask);

  res.status(201).json(populatedTask);
};

// Update task (Status, Subtasks, Comments, Details)
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);

  if (!task) return res.status(404).json({ message: 'Task not found' });

  const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, { new: true })
    .populate('assignees', 'name email')
    .populate('comments.user', 'name');

  await Activity.create({
    project: task.project,
    user: req.user._id,
    action: 'updated task',
    details: `Updated task "${updatedTask.title}".`,
  });

  req.io.to(task.project.toString()).emit('taskUpdated', updatedTask);

  res.json(updatedTask);
};

// Delete Task
const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);

  if (!task) return res.status(404).json({ message: 'Task not found' });

  const projectId = task.project;
  await task.deleteOne();

  await Activity.create({
    project: projectId,
    user: req.user._id,
    action: 'deleted task',
    details: `Deleted task "${task.title}".`,
  });

  req.io.to(projectId.toString()).emit('taskDeleted', taskId);

  res.json({ message: 'Task removed successfully' });
};

// Fetch Activity Logs
const getActivities = async (req, res) => {
  const { projectId } = req.params;
  const activities = await Activity.find({ project: projectId })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  res.json(activities);
};

module.exports = { getTasksByProject, createTask, updateTask, deleteTask, getActivities };
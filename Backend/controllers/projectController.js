const Project = require('../models/Project');
const Activity = require('../models/Activity');

// Get all projects for logged-in user
const getProjects = async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { members: req.user._id }],
  }).populate('members', 'name email');
  res.json(projects);
};

// Create a project
const createProject = async (req, res) => {
  const { name, description } = req.body;
  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: [req.user._id],
  });

  await Activity.create({
    project: project._id,
    user: req.user._id,
    action: 'created',
    details: `Project "${name}" was created.`,
  });

  res.status(201).json(project);
};

module.exports = { getProjects, createProject };
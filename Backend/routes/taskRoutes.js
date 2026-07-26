const express = require('express');
const router = express.Router();
const { getTasksByProject, createTask, updateTask, deleteTask, getActivities } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/project/:projectId', getTasksByProject);
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
router.get('/activity/:projectId', getActivities);

module.exports = router;
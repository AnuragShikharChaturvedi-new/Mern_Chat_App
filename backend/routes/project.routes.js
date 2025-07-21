
import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import * as authMiddleWare from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   POST /project/create
 * @desc    Create a new project for the logged-in user
 * @access  Private
 */
router.post(
  '/create',
  authMiddleWare.authUser,
  body('name').isString().withMessage('Name is required'),
  projectController.createProject
);

/**
 * @route   GET /project/all
 * @desc    Get all projects belonging to the logged-in user
 * @access  Private
 */
router.get(
  '/all',
  authMiddleWare.authUser,
  projectController.getAllProject
);

/**
 * @route   PUT /project/add-user
 * @desc    Add users to a specific project by its ID
 * @access  Private
 */
router.put(
  '/add-user',
  authMiddleWare.authUser,
  body('projectId').isString().withMessage('Project ID is required'),
  body('users')
    .isArray({ min: 1 }).withMessage('Users must be an array of strings')
    .bail()
    .custom((users) => users.every(user => typeof user === 'string'))
    .withMessage('Each user must be a string'),
  projectController.addUserToProject
);

/**
 * @route   GET /project/get-project/:projectId
 * @desc    Get a specific project by its ID
 * @access  Private
 */
router.get(
  '/get-project/:projectId',
  authMiddleWare.authUser,
  projectController.getProjectById
);

/**
 * @route   PUT /project/update-file-tree
 * @desc    Update the file tree structure of a project
 * @access  Private
 */
router.put(
  '/update-file-tree',
  authMiddleWare.authUser,
  body('projectId').isString().withMessage('Project ID is required'),
  body('fileTree').isObject().withMessage('File tree is required'),
  projectController.updateFileTree
);

export default router;

// Import required modules and services
import projectModel from '../models/project.model.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/user.model.js';
import { validationResult } from 'express-validator';


//* @desc   Create a new project
//* @route  POST /project/create
export const createProject = async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body;

        // Find the currently logged-in user from token
        const loggedInUser = await userModel.findOne({ email: req.user.email });
        const userId = loggedInUser._id;

        // Create new project for the user
        const newProject = await projectService.createProject({ name, userId });

        // Send response with created project
        res.status(201).json(newProject);

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
}


//* @desc   Get all projects for the current user
//* @route  GET /project/all
export const getAllProject = async (req, res) => {
    try {
        // Find the logged-in user
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        // Fetch all projects associated with the user ID
        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: loggedInUser._id
        });

        // Send response with all projects
        return res.status(200).json({
            projects: allUserProjects
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}


//* @desc   Add users to an existing project
//* @route  POST /project/add-user
export const addUserToProject = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body;

        // Find current user
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        // Add users to the given project
        const project = await projectService.addUsersToProject({
            projectId,
            users,
            userId: loggedInUser._id
        });

        // Send updated project in response
        return res.status(200).json({ project });

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}


//* @desc   Get a project by its ID
//* @route  GET /project/:projectId
export const getProjectById = async (req, res) => {
    const { projectId } = req.params;

    try {
        // Fetch project using service
        const project = await projectService.getProjectById({ projectId });

        // Return project
        return res.status(200).json({ project });

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}


//* @desc   Update the file tree of a project
//* @route  PUT /project/update-file-tree
export const updateFileTree = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, fileTree } = req.body;

        // Update the file tree of the project
        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        });

        // Return updated project
        return res.status(200).json({ project });

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}

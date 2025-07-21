
// Import required modules
// Import the project model and mongoose for ObjectId validation
import projectModel from '../models/project.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Create a new project with a name and owner (userId)
 * @param   {String} name - Name of the project
 * @param   {ObjectId} userId - ID of the user creating the project
 * @returns {Object} - Newly created project
 */
export const createProject = async ({ name, userId }) => {
    if (!name) throw new Error('Name is required');
    if (!userId) throw new Error('UserId is required');

    let project;
    try {
        project = await projectModel.create({
            name,
            users: [userId]  // Initialize project with creator in users list
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        throw error;
    }

    return project;
};


/**
 * @desc    Fetch all projects associated with a given user ID
 * @param   {ObjectId} userId - User's ID
 * @returns {Array} - List of projects the user is part of
 */
export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) throw new Error('UserId is required');

    const allUserProjects = await projectModel.find({
        users: userId
    });

    return allUserProjects;
};


/**
 * @desc    Add one or more users to a project
 * @param   {ObjectId} projectId - ID of the project
 * @param   {Array<ObjectId>} users - Array of user IDs to add
 * @param   {ObjectId} userId - ID of the current logged-in user
 * @returns {Object} - Updated project document
 */
export const addUsersToProject = async ({ projectId, users, userId }) => {
    if (!projectId) throw new Error("projectId is required");
    if (!mongoose.Types.ObjectId.isValid(projectId)) throw new Error("Invalid projectId");
    if (!users) throw new Error("users are required");

    if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
        throw new Error("Invalid userId(s) in users array");
    }

    if (!userId) throw new Error("userId is required");
    if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid userId");

    const project = await projectModel.findOne({
        _id: projectId,
        users: userId  // Check if current user is authorized
    });

    if (!project) throw new Error("User not belong to this project");

    const updatedProject = await projectModel.findOneAndUpdate(
        { _id: projectId },
        {
            $addToSet: {
                users: { $each: users }  // Add users without duplicates
            }
        },
        { new: true }
    );

    return updatedProject;
};


/**
 * @desc    Get a specific project by its ID
 * @param   {ObjectId} projectId - ID of the project
 * @returns {Object} - Project document with populated user details
 */
export const getProjectById = async ({ projectId }) => {
    if (!projectId) throw new Error("projectId is required");
    if (!mongoose.Types.ObjectId.isValid(projectId)) throw new Error("Invalid projectId");

    const project = await projectModel.findOne({ _id: projectId }).populate('users');

    return project;
};


/**
 * @desc    Update the file tree structure of a project
 * @param   {ObjectId} projectId - ID of the project
 * @param   {Object} fileTree - New file tree JSON object
 * @returns {Object} - Updated project with new file tree
 */
export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) throw new Error("projectId is required");
    if (!mongoose.Types.ObjectId.isValid(projectId)) throw new Error("Invalid projectId");
    if (!fileTree) throw new Error("fileTree is required");

    const project = await projectModel.findOneAndUpdate(
        { _id: projectId },
        { fileTree },
        { new: true }
    );

    return project;
};

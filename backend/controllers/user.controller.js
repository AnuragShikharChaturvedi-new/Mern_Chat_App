// Import necessary modules and services
import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';


//* @desc   Register a new user
//* @route  POST /user/register
export const createUserController = async (req, res) => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Create new user
        const user = await userService.createUser(req.body);

        // Generate JWT token
        const token = await user.generateJWT();

        // Remove password from response
        delete user._doc.password;

        // Send response with user and token
        res.status(201).json({ user, token });

    } catch (error) {
        res.status(400).send(error.message);
    }
}


//* @desc   Login user
//* @route  POST /user/login
export const loginController = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        // Find user by email and include password field
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }

        // Check if password is valid
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
            return res.status(401).json({ errors: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = await user.generateJWT();

        // Remove password before sending response
        delete user._doc.password;

        res.status(200).json({ user, token });

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
}


//* @desc   Get profile of logged-in user
//* @route  GET /user/profile
export const profileController = async (req, res) => {
    // Return user profile from middleware (decoded JWT)
    res.status(200).json({
        user: req.user
    });
}


//* @desc   Logout the user
//* @route  POST /user/logout
export const logoutController = async (req, res) => {
    try {
        // Extract token from cookie or Authorization header
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        // Add token to Redis blacklist (set to expire in 24 hours)
        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        res.status(200).json({
            message: 'Logged out successfully'
        });

    } catch (err) {
        console.log(err);
        res.status(400).send(err.message);
    }
}


//* @desc   Get all users (excluding logged-in user)
//* @route  GET /user/all
export const getAllUsersController = async (req, res) => {
    try {
        // Find current logged-in user
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        // Fetch all other users
        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        });

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
}

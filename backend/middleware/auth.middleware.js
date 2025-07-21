
import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

// Middleware to authenticate the user using JWT
export const authUser = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        // If no token found, return unauthorized error
        if (!token) {
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        // Check if the token is blacklisted (e.g., user logged out)
        const isBlackListed = await redisClient.get(token);

        if (isBlackListed) {
            // Clear the token and return unauthorized
            res.cookie('token', '');
            return res.status(401).send({ error: 'Unauthorized User' });
        }

        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user information to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();

    } catch (error) {
        // Handle errors such as token expiry or tampering
        console.log(error);
        res.status(401).send({ error: 'Unauthorized User' });
    }
}

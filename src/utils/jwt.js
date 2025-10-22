import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const JWT_EXPIRES_IN = '1d';

export const jwttoken = {
    sign: (payload) => {
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        } catch (error) {
            logger.error('Failed to Authenticate Token:', error);
            throw new Error('Failed to Authenticate Token');
        }
    },
    verify: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error('Failed to Verify Token:', error);
            throw new Error('Failed to Verify Token');
        }
    },
}

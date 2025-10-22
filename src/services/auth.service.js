import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    logger.error('Hash Password Error', e);
    throw new Error('Password hashing failed');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (e) {
    logger.error('Compare Password Error', e);
    throw new Error('Password comparison failed');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);
    const user = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info(`User registered successfully: ${email}`);
    return user[0];
  } catch (e) {
    logger.error('Create User Error', e);
    throw e;
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    const isPasswordValid = await comparePassword(password, existingUser[0].password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    logger.info(`User authenticated successfully: ${email}`);
    return {
        id: existingUser[0].id,
        name: existingUser[0].name,
        email: existingUser[0].email,
        role: existingUser[0].role,
        created_at: existingUser[0].created_at,
    };
  } catch (e) {
    logger.error('Authenticate User Error', e);
    throw e;
  }
};

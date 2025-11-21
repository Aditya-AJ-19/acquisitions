import { db } from '#config/database.js';
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import { hashPassword } from '#services/auth.services.js';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (e) {
    logger.error('Error in getAllUsers:', e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user[0] || null;
  } catch (e) {
    logger.error('Error in getUserById:', e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    const updateData = { ...updates };
    if (updates.password) {
      updateData.password = await hashPassword(updates.password);
    }

    const updatedUser = await db
      .update(users)
      .set({ ...updateData, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    return updatedUser[0];
  } catch (e) {
    logger.error('Error in updateUser:', e);
    throw e;
  }
};

export const deleteUser = async id => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('User not found');
    }

    await db.delete(users).where(eq(users.id, id));
    return { id, message: 'User deleted successfully' };
  } catch (e) {
    logger.error('Error in deleteUser:', e);
    throw e;
  }
};

// ==========================================
// User Service
// ==========================================
// Handles user profile management and categories.
// Separated from auth service for single-responsibility.

import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import {
  UpdateProfileInput,
  ChangePasswordInput,
  CreateCategoryInput,
} from "../validators/user.validator";

const SALT_ROUNDS = 12;

// ==========================================
// Get user profile
// ==========================================
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      _count: { select: { expenses: true, categories: true, budgets: true } },
    },
  });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return user;
};

// ==========================================
// Update user profile
// ==========================================
export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
) => {
  // If updating email, check uniqueness
  if (input.email) {
    const existing = await prisma.user.findFirst({
      where: { email: input.email, id: { not: userId } },
    });
    if (existing) {
      throw ApiError.conflict("Email is already in use");
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
    },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  return user;
};

// ==========================================
// Change password
// ==========================================
export const changePassword = async (
  userId: string,
  input: ChangePasswordInput
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Verify current password
  const isValid = await bcrypt.compare(input.currentPassword, user.password);
  if (!isValid) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  // Hash and update new password
  const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Invalidate all refresh tokens for security
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

// ==========================================
// Get user categories
// ==========================================
export const getCategories = async (userId: string) => {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { expenses: true } } },
  });

  return categories;
};

// ==========================================
// Create a category
// ==========================================
export const createCategory = async (
  userId: string,
  input: CreateCategoryInput
) => {
  // Check for duplicate name
  const existing = await prisma.category.findFirst({
    where: { userId, name: input.name },
  });

  if (existing) {
    throw ApiError.conflict("Category with this name already exists");
  }

  const category = await prisma.category.create({
    data: {
      userId,
      name: input.name,
      icon: input.icon || null,
      color: input.color || null,
    },
  });

  return category;
};

// ==========================================
// Update a category
// ==========================================
export const updateCategory = async (
  userId: string,
  categoryId: string,
  input: Partial<CreateCategoryInput>
) => {
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!existing) {
    throw ApiError.notFound("Category not found");
  }

  // Check name uniqueness if changing name
  if (input.name && input.name !== existing.name) {
    const duplicate = await prisma.category.findFirst({
      where: { userId, name: input.name, id: { not: categoryId } },
    });
    if (duplicate) {
      throw ApiError.conflict("Category with this name already exists");
    }
  }

  const category = await prisma.category.update({
    where: { id: categoryId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.color !== undefined && { color: input.color }),
    },
  });

  return category;
};

// ==========================================
// Delete a category
// ==========================================
export const deleteCategory = async (userId: string, categoryId: string) => {
  const existing = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!existing) {
    throw ApiError.notFound("Category not found");
  }

  // Expenses with this category will have categoryId set to NULL (onDelete: SetNull)
  await prisma.category.delete({ where: { id: categoryId } });
};

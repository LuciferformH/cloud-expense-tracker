// ==========================================
// User Controller
// ==========================================
// Handles HTTP request/response for user profile and categories.

import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import * as userService from "../services/user.service";
import { AuthRequest } from "../types";

// GET /api/users/profile
export const getProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const profile = await userService.getProfile(req.user!.userId);
    ApiResponse.success(res, "Profile retrieved", profile);
  }
);

// PUT /api/users/profile
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const profile = await userService.updateProfile(req.user!.userId, req.body);
    ApiResponse.success(res, "Profile updated", profile);
  }
);

// PUT /api/users/password
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await userService.changePassword(req.user!.userId, req.body);
    ApiResponse.success(res, "Password changed successfully");
  }
);

// GET /api/users/categories
export const getCategories = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const categories = await userService.getCategories(req.user!.userId);
    ApiResponse.success(res, "Categories retrieved", categories);
  }
);

// POST /api/users/categories
export const createCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const category = await userService.createCategory(req.user!.userId, req.body);
    ApiResponse.created(res, "Category created", category);
  }
);

// PUT /api/users/categories/:id
export const updateCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const category = await userService.updateCategory(
      req.user!.userId,
      req.params.id as string,
      req.body
    );
    ApiResponse.success(res, "Category updated", category);
  }
);

// DELETE /api/users/categories/:id
export const deleteCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await userService.deleteCategory(req.user!.userId, req.params.id as string);
    ApiResponse.noContent(res);
  }
);

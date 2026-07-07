// ==========================================
// Authentication Service
// ==========================================
// Handles all authentication business logic:
// - User registration with password hashing
// - Login with credential verification
// - Token refresh with rotation
// - Password reset flow
// Separated from controller for reusability and testability.

import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/database";
import { ApiError } from "../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  verifyAccessToken,
  TokenPayload,
} from "../utils/jwt";
import { emailTransporter, EMAIL_FROM } from "../config/email";
import { env } from "../config/env";
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validators/auth.validator";

const SALT_ROUNDS = 12;

// ==========================================
// Register a new user
// ==========================================
export const register = async (input: RegisterInput) => {
  // Check if email is already taken
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw ApiError.conflict("Email is already registered");
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  // Create user with default categories
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      categories: {
        create: [
          { name: "Compute", icon: "cpu", color: "#3B82F6" },
          { name: "Storage", icon: "database", color: "#10B981" },
          { name: "Networking", icon: "network", color: "#F59E0B" },
          { name: "Database", icon: "server", color: "#8B5CF6" },
          { name: "Other", icon: "layers", color: "#6B7280" },
        ],
      },
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  // Generate tokens
  const tokenPayload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { user, accessToken, refreshToken };
};

// ==========================================
// Login with email and password
// ==========================================
export const login = async (input: LoginInput) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Generate tokens
  const tokenPayload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken();

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
    refreshToken,
  };
};

// ==========================================
// Refresh access token using refresh token
// ==========================================
export const refreshAccessToken = async (refreshToken: string) => {
  // Find the refresh token in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!storedToken) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  // Check if token is expired
  if (new Date() > storedToken.expiresAt) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw ApiError.unauthorized("Refresh token expired");
  }

  // Rotate: delete old token, create new one
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const tokenPayload: TokenPayload = {
    userId: storedToken.user.id,
    email: storedToken.user.email,
  };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      userId: storedToken.user.id,
      token: newRefreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ==========================================
// Logout (invalidate refresh token)
// ==========================================
export const logout = async (refreshToken: string) => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

// ==========================================
// Forgot password - send reset email
// ==========================================
export const forgotPassword = async (input: ForgotPasswordInput) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: "If the email exists, a reset link has been sent." };
  }

  // Delete any existing reset tokens for this user
  await prisma.passwordReset.deleteMany({
    where: { userId: user.id },
  });

  // Create new reset token (valid for 1 hour)
  const resetToken = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await prisma.passwordReset.create({
    data: { userId: user.id, token: resetToken, expiresAt },
  });

  // Send reset email if SMTP is configured
  if (emailTransporter) {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await emailTransporter.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject: "Cloud Expense Tracker - Password Reset",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }

  return { message: "If the email exists, a reset link has been sent." };
};

// ==========================================
// Reset password with token
// ==========================================
export const resetPassword = async (input: ResetPasswordInput) => {
  // Find valid reset token
  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token: input.token },
  });

  if (!resetRecord) {
    throw ApiError.badRequest("Invalid or expired reset token");
  }

  // Check expiry
  if (new Date() > resetRecord.expiresAt) {
    await prisma.passwordReset.delete({ where: { id: resetRecord.id } });
    throw ApiError.badRequest("Reset token has expired");
  }

  // Hash new password and update
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordReset.delete({ where: { id: resetRecord.id } }),
    // Invalidate all refresh tokens for security
    prisma.refreshToken.deleteMany({
      where: { userId: resetRecord.userId },
    }),
  ]);

  return { message: "Password reset successful" };
};

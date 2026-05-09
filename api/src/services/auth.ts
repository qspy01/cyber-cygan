import { z } from 'zod';
import * as identityService from './identity.js';
import { hashPassword, comparePassword } from '../util/auth.js';

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export const signup = async (input: SignupInput) => {
  const hashedPassword = await hashPassword(input.password);
  await identityService.createUser({
    email: input.email,
    passwordHash: hashedPassword,
  });
  return { success: true };
};

export const login = async (input: LoginInput) => {
  const user = await identityService.getUserByEmail(input.email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  return user;
};

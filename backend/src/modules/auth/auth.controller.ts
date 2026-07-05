import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import * as authService from "./auth.service";

// Controllers stay thin: parse request, call service, shape response.
// No business logic, no direct DB access — per ARCHITECTURE.md.

export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body);
    sendSuccess(res, {data: result, statusCode: 201});
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body);
    sendSuccess(res, {data: result});
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refreshTokens(req.body.refreshToken);
    sendSuccess(res, {data: result});
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    await authService.logoutUser(req.body.refreshToken);
    sendSuccess(res, {data: {message: "Logged out successfully"}});
});

export const me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.id);
    sendSuccess(res, {data: user});
});

import {Request, Response} from "express";
import {asyncHandler} from "../../utils/async-handler";
import {sendSuccess} from "../../utils/api-response";
import {
    clearRefreshTokenCookie,
    setPrivateAuthResponseHeaders,
    setRefreshTokenCookie,
} from "./auth-cookie";
import * as authService from "./auth.service";

function sendAuthSession(
    res: Response,
    result: authService.AuthSessionResult,
    statusCode = 200
): void {
    const {refreshToken, ...publicResult} = result;

    setPrivateAuthResponseHeaders(res);
    setRefreshTokenCookie(res, refreshToken);
    sendSuccess(res, {
        data: publicResult,
        statusCode,
    });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body);
    sendAuthSession(res, result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body);
    sendAuthSession(res, result);
});

export const csrf = asyncHandler(async (req: Request, res: Response) => {
    const csrfToken = await authService.getRefreshCsrfToken(req.refreshSession!.refreshToken);

    setPrivateAuthResponseHeaders(res);
    sendSuccess(res, {
        data: {csrfToken},
    });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refreshTokens(
        req.refreshSession!.refreshToken,
        req.refreshSession!.csrfToken!
    );

    sendAuthSession(res, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    setPrivateAuthResponseHeaders(res);

    try {
        await authService.logoutUser(
            req.refreshSession!.refreshToken,
            req.refreshSession!.csrfToken!
        );
    } finally {
        clearRefreshTokenCookie(res);
    }

    sendSuccess(res, {
        data: {message: "Logged out successfully"},
    });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.id);
    sendSuccess(res, {data: user});
});

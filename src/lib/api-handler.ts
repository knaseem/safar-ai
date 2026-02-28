import { NextResponse } from "next/server";

/**
 * Standardized API Response formats for SafarAI
 */

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: any;
}

/**
 * Returns a standardized success response.
 * @param data The payload to return
 * @param message Optional success message
 * @param status HTTP Status Code (default: 200)
 */
export function apiSuccess<T>(data: T, message?: string, status: number = 200, meta?: any) {
    return NextResponse.json(
        {
            success: true,
            data,
            message,
            meta
        } as ApiResponse<T>,
        { status }
    );
}

/**
 * Returns a standardized error response.
 * @param error The error message or Error object
 * @param status HTTP Status Code (default: 500)
 */
export function apiError(error: string | Error, status: number = 500) {
    const errorMessage = error instanceof Error ? error.message : error;

    // In production, we might want to log this to an external service like Sentry
    if (process.env.NODE_ENV !== 'test' && status >= 500) {
        console.error(`[API ERROR ${status}]:`, errorMessage);
    }

    return NextResponse.json(
        {
            success: false,
            error: errorMessage
        } as ApiResponse,
        { status }
    );
}

/**
 * Higher-order function to wrap API Route handlers, automatically catching errors
 * and converting them to standardized apiError responses.
 */
export function withApiHandler(handler: (req: Request, ...args: any[]) => Promise<NextResponse>) {
    return async (req: Request, ...args: any[]) => {
        try {
            return await handler(req, ...args);
        } catch (error: any) {
            return apiError(error, error?.status || 500);
        }
    };
}

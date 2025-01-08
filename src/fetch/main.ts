import { safe } from "../safe/main.ts";

/**
 * @module fetchWithCallbacks
 * Callbacks types
 */
export type FetchCallbacks<JsonResponse, JsonError, BeforeReturnType, AfterReturnType> = {
    onError?: (res: Response, data: JsonError) => unknown;
    onSuccess?: (res: Response, data: JsonResponse) => unknown;
    before?: () => BeforeReturnType;
    after?: (context: { res: Response; json: JsonError | JsonResponse; before?: BeforeReturnType }) => AfterReturnType;
};

/**
 * @info Success response type
 */
export type SuccessResponse<JsonResponse, AfterReturnType> = {
    response: Response;
    data: JsonResponse;
    afterData: AfterReturnType;
};

/**
 * @info Error response type
 */
export type ErrorResponse<JsonError, AfterReturnType> = {
    response: Response;
    data: JsonError;
    afterData: AfterReturnType;
};

const defaultCallbacks = {
    onError: (_res: Response, data: unknown) => data,
    onSuccess: (_res: Response, data: unknown) => data,
    before: () => void 0,
    after: () => void 0,
};

/**
 * @info Callbacks:
 * - onSuccess executed when response.ok
 * - onError executed when response.ok is false
 *
 *
 */
export const fetchWithCallbacks = <
    JsonResponse = unknown,
    JsonError = unknown,
    BeforeReturnType = unknown,
    AfterReturnType = unknown
>(
    url: string,
    callbacks: FetchCallbacks<JsonResponse, JsonError, BeforeReturnType, AfterReturnType>,
    options: RequestInit = {}
): Promise<SuccessResponse<JsonResponse, AfterReturnType> | ErrorResponse<JsonError, AfterReturnType>> => {
    const { onError, onSuccess, before, after } = { ...defaultCallbacks, ...callbacks };

    const executeBeforeFetch = () => {
        if (before) {
            return before();
        }
        return undefined;
    };

    const executeAfterFetch = (res: Response, json: JsonError | JsonResponse, before: BeforeReturnType | undefined) => {
        if (after) {
            return after({ res, json, before });
        }
        return undefined;
    };

    const executeFetch = async () => {
        const res = await fetch(url, options);
        const json = await res.json();
        return { res, json };
    };

    const handleSuccess = (
        res: Response,
        json: JsonResponse,
        afterData: AfterReturnType | undefined
    ): SuccessResponse<JsonResponse, AfterReturnType> => {
        const data = onSuccess ? onSuccess(res, json) : json;
        return { response: res, data, afterData } as SuccessResponse<JsonResponse, AfterReturnType>;
    };

    const handleError = (
        res: Response,
        json: JsonError,
        afterData: AfterReturnType | undefined
    ): ErrorResponse<JsonError, AfterReturnType> => {
        const data = onError ? onError(res, json) : json;
        return { response: res, data, afterData } as ErrorResponse<JsonError, AfterReturnType>;
    };

    return safe(async () => {
        const beforePayload = executeBeforeFetch();
        const { res, json } = await executeFetch();
        const afterPayload = executeAfterFetch(res, json, beforePayload);

        return res.ok
            ? handleSuccess(res, json as JsonResponse, afterPayload)
            : handleError(res, json as JsonError, afterPayload);
    });
};

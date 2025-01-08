import { safe } from "../safe/main.ts";

/**
 * @module fetchWithCallbacks
 * Callbacks types
 */
export type FetchCallbacks<JsonResponse, JsonError, BeforeReturnType, AfterReturnType> = {
    onError?: (res: Response, data: JsonError) => unknown;
    onSuccess?: (res: Response, data: JsonResponse) => unknown;
    before?: (fetchOptions: RequestInit) => BeforeReturnType;
    after?: (context: { res: Response; json: JsonError | JsonResponse }, args?: BeforeReturnType) => AfterReturnType;
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

/**
 * @info Callbacks:
 * - onSuccess executed when response.ok
 * - onError executed when response.ok is false
 * - before return data === after parameter
 *
 * @exemple
 * ```ts
 *
 * type Post = {
 *  userId: number;
 *  id: number;
 *  title: string;
 *  completed: boolean;
 * };
 *
 * type ErrorPost = {
 *   message: string;
 * };
 *
 * const { response, data, afterData } = await fetchWithCallbacks<Post, ErrorPost, string>("https://dummyjson.com/todos/1?delay=3000", {
 *  onError: (res, data) => {
 *      console.error("Error:", res.status, data);
 *      return data;
 *  },
 *  onSuccess: (_res, data) => {
 *      console.log("Success:", data);
 *      return data;
 *  },
 *  before: () => "Hello from before",
 *  after: (beforeReturn) => {
 *      console.log("After callback:", beforeReturn);
 *  },
 *});
 * ```
 */
export const fetchWithCallbacks = <
    JsonResponse = unknown,
    JsonError = unknown,
    BeforeReturnType = unknown,
    AfterReturnType = unknown
>(
    url: string,
    callbacks: FetchCallbacks<JsonResponse, JsonError, BeforeReturnType, AfterReturnType>
): Promise<SuccessResponse<JsonResponse, AfterReturnType> | ErrorResponse<JsonError, AfterReturnType>> => {
    return safe(async () => {
        const { onError, onSuccess, before, after } = callbacks;
        let data: JsonResponse | JsonError;
        const options: RequestInit = {};

        // Execute the `before` callback if provided.
        const beforePayload = before ? (before(options) as BeforeReturnType) : undefined;

        // Perform the fetch operation and parse the JSON response.
        const { res, json } = await (async () => {
            const res = await fetch(url, options);
            return { res, json: (await res.json()) as JsonResponse | JsonError };
        })();

        let afterData: AfterReturnType | undefined = undefined;
        if (after) afterData = after({ res, json }, beforePayload);

        if (res.ok) {
            data = onSuccess ? (onSuccess(res, json as JsonResponse) as JsonResponse) : (json as JsonResponse);
            return { response: res, data, afterData } as SuccessResponse<JsonResponse, AfterReturnType>;
        }
        data = onError ? (onError(res, json as JsonError) as JsonError) : (json as JsonError);
        return { response: res, data, afterData } as ErrorResponse<JsonError, AfterReturnType>;
    });
};

// | Promise<{
//     response: Response;
//     data: JsonResponse | JsonError;
//     afterData: AfterReturnType;
// }>

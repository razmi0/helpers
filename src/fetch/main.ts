import { safe } from "../safe/main.ts";

/**
 * @module fetchWithCallbacks
 * Callbacks types
 */
export type FetchCallbacks<JsonResponse, JsonError, BeforeReturnType, AfterReturnType> = {
    onError?: (res: Response, data: JsonError) => unknown;
    onSuccess?: (res: Response, data: JsonResponse) => unknown;
    before?: () => BeforeReturnType;
    after?: (args?: BeforeReturnType) => AfterReturnType;
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
):
    | Promise<{
          response: Response;
          data: JsonResponse;
          afterData: AfterReturnType;
      }>
    | Promise<{
          response: Response;
          data: JsonError;
          afterData: AfterReturnType;
      }>
    | Promise<{
          response: Response;
          data: JsonResponse | JsonError;
          afterData: AfterReturnType;
      }> => {
    return safe(async () => {
        const { onError, onSuccess, before, after } = callbacks;
        let data: JsonResponse | JsonError;

        // Execute the `before` callback if provided.
        const beforePayload = before ? (before() as BeforeReturnType) : undefined;

        // Perform the fetch operation and parse the JSON response.
        const { response, json } = await (async () => {
            const response = await fetch(url);
            return { response, json: (await response.json()) as JsonResponse | JsonError };
        })();

        let afterData: AfterReturnType | undefined = undefined;
        if (after) afterData = after(beforePayload);

        if (response.ok) {
            data = onSuccess ? (onSuccess(response, json as JsonResponse) as JsonResponse) : (json as JsonResponse);
            return { response, data, afterData } as {
                response: Response;
                data: JsonResponse;
                afterData: AfterReturnType;
            };
        }
        data = onError ? (onError(response, json as JsonError) as JsonError) : (json as JsonError);
        return { response, data, afterData } as { response: Response; data: JsonError; afterData: AfterReturnType };
    });
};

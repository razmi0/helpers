import { assertEquals, assertRejects } from "@std/assert";
import { mockFetch } from "./helpers/utils.ts";
import { fetchWithCallbacks } from "../src/fetch/main.ts";

type APIFetchData = {
    success: {
        message: "Success";
    }[];
    error: {
        message: "Not Found";
    }[];
};

// Test: Handle successful fetch
Deno.test("[onSuccess] : should handle successful fetch", async () => {
    mockFetch({
        expected: "success",
        returnData: {
            message: "Success",
        },
    });

    const result = await fetchWithCallbacks<APIFetchData["success"]>("", {
        onSuccess: (_response, json) => [json, "additional data"],
    });

    assertEquals(result.response.status, 200);
    assertEquals(result.data, [{ message: "Success" }, "additional data"]);
});

// Test: Handle fetch error 404
Deno.test("[onError] : should handle fetch error 404", async () => {
    mockFetch({
        expected: "error",
        returnData: {
            message: "Not Found",
        },
    });

    const result = await fetchWithCallbacks<never, APIFetchData["error"]>("", {
        onError: (_response, json) => [json, "additional error data"],
    });

    assertEquals(result.data, [{ message: "Not Found" }, "additional error data"]);
    assertEquals(result.response.status, 404);
});

// Test: Handle promise rejection in before callback
Deno.test("[before] : should handle promise rejection in before callback", () => {
    assertRejects(() => {
        return fetchWithCallbacks<never, never>("", {
            before: () => {
                throw new Error("Error");
            },
        });
    });
});

// Test: Return the before callback's return data in after callback
Deno.test("[after] : should return the before callback's return data", async () => {
    const result = await fetchWithCallbacks<never, never, "Hi from before">("", {
        before: () => "Hi from before",
        after: (beforeReturn) => beforeReturn,
    });

    assertEquals(result.afterData, "Hi from before");
});

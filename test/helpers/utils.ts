// Fetch mock

// Successful response
export const mockFetch = <T>({ returnData, expected }: { returnData: T; expected: "error" | "success" }) => {
    globalThis.fetch = (_input: string | URL | Request = "") => {
        if (expected === "error") {
            return Promise.resolve(
                new Response(JSON.stringify(returnData), {
                    status: 404,
                    statusText: "Not Found",
                })
            );
        }
        return Promise.resolve(
            new Response(JSON.stringify(returnData), {
                status: 200,
                statusText: "Success",
            })
        );
    };
};

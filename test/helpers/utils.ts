// Fetch mock

// Successful response
export const mockFetch = <T>({
    returnData,
    expected,
}: {
    returnData: T;
    expected: "error" | "success" | "mutated";
}) => {
    globalThis.fetch = (_input: string | URL | Request = "") => {
        switch (expected) {
            // not implemented
            case "mutated":
                return Promise.resolve(
                    new Response(JSON.stringify(returnData), {
                        status: 200,
                        statusText: "Success",
                    })
                );

            case "error":
                return Promise.resolve(
                    new Response(JSON.stringify(returnData), {
                        status: 404,
                        statusText: "Not Found",
                    })
                );

            default:
                return Promise.resolve(
                    new Response(JSON.stringify(returnData), {
                        status: 200,
                        statusText: "Success",
                    })
                );
        }
    };
};

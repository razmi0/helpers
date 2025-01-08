# @razmio/helpers

## Overview

`@razmio/helpers` is a collection of utility functions and modules designed to simplify common tasks in your Deno projects. This package provides a variety of helper functions to enhance productivity and code readability.

## Installation

```sh
deno add jsr:@razmio/helpers
```

## Usage

```ts
import * as helpers from "@razmio/helpers";
```

wait for 1 second and then log "Hello World"

```ts
helpers.wait(1000).then(() => {
    console.log("Hello World");
});
```

secure way to run a function that might throw an error

```ts
helpers.safe(() => {
    // some code that might throw an error
});
```

Safe helper is used in fetchWithCallbacks for exemple :

```ts
const { response, data, afterData } = await helpers.fetchWithCallbacks<
    { message: "success" }, // ReturnType<onSuccess>
    { message: "failed" }, // ReturnType<onError>
    string, // ReturnType<before>
    string // ReturnType<after>
>("<https://example.com>", {
    onSuccess: (response, data) => [response, data], //  in the 200-299 range
    onError: (response, data) => [response, data], // in the >= 300 range
    before: () => "Hello before ", // before the request is sent
    after: (before) => `${before} and hello after`, // after the request is completed
});
```

It follow :

```text
before
✅ Granted all net access.
after
onSuccess / onError
```

Add a spinner with before and after

```ts
// ...
before: () => {
    const spinner = new helpers.Spinner();
    spinner.start();
    return spinner;
};
after: (spinner) => {
    spinner.stop();
};
// ...

// the spinner in the terminal is blue with :
helpers.colorfull("blue", "Hello World");
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## Contact

For any questions or feedback, please contact the project maintainers.

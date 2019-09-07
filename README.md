# `envjs`

A drop-in for `dotenv` that allows us to semantically, simply, and openly
declare environmental variables and constants for a JavaScript package
or application. Compiles to UMD so it can be used in Browser-based apps
(using an object placed in the global namespace as an "environment-
injection" point for the server).

_This is a **work in progress**._

To Do:

- Remove `dotenv` and `debug` dependencies, or at least structure the
  debug dependency so that rollup pulls in the UMD package.
- Add tests.
- Get to work in the browser.
- Add debug points.
- Also export an ESM module.

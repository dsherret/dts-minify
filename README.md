# dts-minify

[![npm version](https://badge.fury.io/js/dts-minify.svg)](https://badge.fury.io/js/dts-minify)
[![CI](https://github.com/dsherret/dts-minify/workflows/CI/badge.svg)](https://github.com/dsherret/dts-minify/actions?query=workflow%3ACI)

Minifies TypeScript declaration files (`.d.ts` files).

Strips:

- Non-essential whitespace and newlines.
- Comments, but keeps triple-slash directives.

## Use Case

This library is useful for minifying declaration files that won't be read by humans.

## Api

- [Declarations](lib/dts-minify.d.ts)

```ts
import { createMinifier } from "dts-minify";
import * as ts from "typescript";

// setup (provide a TS Compiler API object)
const minifier = createMinifier(ts);

// minify
const inputText = `declare class MyClass {
    /**
     * Some description.
     */
    doSomething(value: number): number;
}`;
const minifiedText = minifier.minify(inputText);

console.log(minifiedText);
```

Outputs:

<!-- dprint-ignore -->

```ts
declare class MyClass{doSomething(value:number):number;}
```

### Options

#### `keepJsDocs`

When true, it won't remove the JS docs.

```ts
const minifiedText = minifier.minify(inputText, {
    keepJsDocs: true, // false by default
});
```

Outputs:

<!-- dprint-ignore -->

```ts
declare class MyClass{/**
 * Some description.
 */doSomething(value:number):number;}
```

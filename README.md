# dts-minify

[![npm version](https://badge.fury.io/js/dts-minify.svg)](https://badge.fury.io/js/dts-minify)
[![Build Status](https://travis-ci.org/dsherret/dts-minify.svg?branch=latest)](https://travis-ci.org/dsherret/dts-minify)

Minifies TypeScript declaration files (`.d.ts` files).

Strips:

* Non-essential whitespace and newlines.
* Non-js doc and non-type directive comments.

## Use Case

This library is useful for minifying declaration files that won't be read by humans.

## Api

* [Declarations](lib/dts-minify.d.ts)

```ts
import * as ts from "typescript";
import { createMinifier } from "dts-minify";

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

```ts
declare class MyClass{/**
 * Some description.
 */doSomething(value:number):number;}
```

### Options

```ts
const minifiedText = minifier.minify(inputText, {
    stripJsDocs: true // false by default
});
```

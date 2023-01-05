import { parse } from "https://deno.land/std@0.171.0/flags/mod.ts";
import { createMinifier } from "./mod.ts";
import { ts } from "https://deno.land/x/ts_morph@17.0.1/mod.ts";

// setup (provide a TS Compiler API object)
const minifier = createMinifier(ts);

const flags = parse(Deno.args, {
  boolean: ["keepJsDocs"],
  string: ["inputFile", "outputFile"],
  alias: {
    "i": "inputFile",
    "o": "outputFile",
  },
});

let text = "";

// if an input file is provided, read it, otherwise read from stdin
if (flags.inputFile) {
  text = await Deno.readTextFile(flags.inputFile);
} else {
  const decoder = new TextDecoder();
  for await (const chunk of Deno.stdin.readable) {
    text += decoder.decode(chunk);
  }
}

const result = minifier.minify(text, {
  keepJsDocs: flags.keepJsDocs,
});

// if an output file is provided, write to it, otherwise write to stdout
if (flags.outputFile) {
  await Deno.writeTextFile(flags.outputFile, result);
} else {
  console.log(result);
}

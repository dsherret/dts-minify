import { build } from "https://deno.land/x/dnt@0.6.0/mod.ts";

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  test: false, // wait for ts-morph to be distributed as an es module
  package: {
    name: "dts-minify",
    version: Deno.args[0],
    description: "Minifier for TypeScript declaration files (.d.ts).",
    main: "dist/dts-minify.js",
    author: "David Sherret",
    license: "MIT",
    repository: "git+https://github.com/dsherret/dts_minify.git",
  },
  mappings: {
    "https://deno.land/x/ts_morph@12.2.0/mod.ts": {
      name: "ts-morph",
      version: "12.2.0",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");

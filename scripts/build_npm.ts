import { build } from "https://deno.land/x/dnt@0.32.1/mod.ts";

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  test: true,
  package: {
    name: "dts-minify",
    version: Deno.args[0],
    description: "Minifier for TypeScript declaration files (.d.ts).",
    main: "dist/dts-minify.js",
    author: "David Sherret",
    license: "MIT",
    repository: "git+https://github.com/dsherret/dts_minify.git",
  },
  shims: {
    deno: {
      test: "dev",
    },
  },
  mappings: {
    "https://deno.land/x/ts_morph@17.0.1/mod.ts": {
      name: "ts-morph",
      version: "17.0.1",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");

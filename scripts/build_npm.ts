import { build } from "@deno/dnt";

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./npm",
  test: true,
  importMap: "./deno.json",
  package: {
    name: "dts-minify",
    version: Deno.args[0],
    description: "Minifier for TypeScript declaration files (.d.ts).",
    author: "David Sherret",
    license: "MIT",
    repository: "git+https://github.com/dsherret/dts_minify.git",
  },
  shims: {
    deno: {
      test: "dev",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");

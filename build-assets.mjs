import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile, rename } from "node:fs/promises";

const assets = [
  { source: "index.js", reference: "index.js" },
  { source: "output.css", reference: "output.css" },
];

await rm("dist", { recursive: true, force: true });
await mkdir("dist");

let html = await readFile("index.html", "utf8");

for (const asset of assets) {
  const content = await readFile(asset.source);
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 12);
  const name = asset.source.replace(".", `.${hash}.`);

  await rename(asset.source, `dist/${name}`);
  html = html.replaceAll(asset.reference, name);
}

await writeFile("dist/index.html", html);

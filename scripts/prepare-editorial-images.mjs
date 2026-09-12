import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
const output = new URL("../public/editorial-2026/", import.meta.url);
await mkdir(output, { recursive: true });
for (const name of ["receipt", "business", "home-shopping"]) {
  for (const width of [640, 1280]) {
    await sharp(fileURLToPath(new URL("../design/editorial/" + name + ".png", import.meta.url)))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(fileURLToPath(new URL(name + "-" + width + ".webp", output)));
  }
}

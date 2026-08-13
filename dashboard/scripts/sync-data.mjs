import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../../normalizer/data/normalized-output.json");
const DEST_DIR = path.resolve(__dirname, "../public/data");
const DEST = path.join(DEST_DIR, "normalized-output.json");

await mkdir(DEST_DIR, { recursive: true });
await copyFile(SRC, DEST);
console.log(`Synced normalized output -> ${DEST}`);

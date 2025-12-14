import { readFileSync } from "node:fs";
import { ingestRawText } from "../core/ingestion/ingest.js";

// Resolve the example file from the source directory so it exists before build.
const raw = readFileSync(new URL("../../src/demo/example.txt", import.meta.url), "utf-8");
const project = ingestRawText(raw, "Example Manuscript", "Anonymous");
console.log(JSON.stringify(project, null, 2));

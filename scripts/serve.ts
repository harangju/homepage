import { file, serve } from "bun";
import { join } from "path";

const PORT = 3000;
const BUILD_DIR = join(import.meta.dir, "..", "build");

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    // Try to serve the exact file
    let filePath = join(BUILD_DIR, path);
    let f = file(filePath);

    if (await f.exists()) {
      return new Response(f);
    }

    // Try with .html extension
    f = file(filePath + ".html");
    if (await f.exists()) {
      return new Response(f);
    }

    // Try index.html in directory
    f = file(join(filePath, "index.html"));
    if (await f.exists()) {
      return new Response(f);
    }

    // SPA fallback - serve index.html for all other routes
    f = file(join(BUILD_DIR, "index.html"));
    return new Response(f);
  },
});

console.log(`Server running at http://localhost:${PORT}/`);

import { createHash } from "node:crypto";
import { defineConfig } from "vite";
import { themeBootstrapScript } from "@abuzareal/contour-ui/theme-bootstrap";
const hash = createHash("sha256").update(themeBootstrapScript).digest("base64");
export default defineConfig({
  plugins: [
    {
      name: "contour-theme-bootstrap",
      transformIndexHtml(html) {
        // Hash the exact bytes inserted here; no inline handler or unsafe-eval allowance.
        const policy = `default-src 'self'; script-src 'self' 'sha256-${hash}'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'`;
        return html.replace(
          "<!-- theme-bootstrap -->",
          `<meta http-equiv="Content-Security-Policy" content="${policy}"><script>${themeBootstrapScript}</script>`,
        );
      },
    },
  ],
});

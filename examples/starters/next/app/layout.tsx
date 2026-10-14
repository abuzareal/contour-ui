import { headers } from "next/headers";
import { themeBootstrapScript } from "@abuzareal/contour-ui/theme-bootstrap";
import "@abuzareal/contour-ui/scoped.css";
import "./style.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Contour Next starter" };
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f2f3ee" />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

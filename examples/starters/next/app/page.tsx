import { safeHref } from "@abuzareal/contour-ui";
import Demo from "./Demo";
export default function Page() {
  return (
    <main className="contour-root starter">
      <h1>Contour Next starter</h1>
      <p>Server helper result: {safeHref("/next-page")}</p>
      <Demo />
    </main>
  );
}

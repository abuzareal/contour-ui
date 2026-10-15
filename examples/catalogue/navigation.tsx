import { useState } from "react";
import { Tabs, Breadcrumbs, Pagination, Stepper } from "@abuzareal/contour-ui";

export default function Navigation() {
  const [page, setPage] = useState(1);
  const [activeTabId, setActiveTabId] = useState("overview");
  return (
    <>
      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Projects" }]}
      />
      <Tabs
        label="Project information"
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: <p>Project overview.</p>,
          },
          { id: "details", label: "Details", content: <p>Project details.</p> },
        ]}
      />
      <p role="status">Selected tab: {activeTabId}.</p>
      <Pagination
        page={page}
        pageCount={5}
        onChange={setPage}
        label="Result pages"
      />
      <p>Selected page: {page}. Supply your own results.</p>
      <Stepper
        current={1}
        steps={[
          { label: "Details" },
          { label: "Review" },
          { label: "Complete" },
        ]}
      />
    </>
  );
}

import { DataTable, type TableColumn } from "@abuzareal/contour-ui";

type Project = { id: string; name: string; examples: number };
const rows: Project[] = [{ id: "demo", name: "Example project", examples: 3 }];
const columns: TableColumn<Project>[] = [
  { key: "name", header: "Project", sortable: true },
  { key: "examples", header: "Examples", align: "end", sortable: true },
];
export default function ProjectTable() {
  return (
    <DataTable
      caption="Illustrative projects"
      columns={columns}
      rows={rows}
      rowKey="id"
    />
  );
}

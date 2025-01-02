import { api } from "@/trpc/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateDiagramButton } from "./CreateDiagramButton";

export default async function DiagramsPage() {
  const designs = await api.excalidraw.listDesigns();
  return (
    <div>
      <CreateDiagramButton />
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Last Modified</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designs.map((design) => (
            <TableRow key={design.id}>
              <TableCell>{design.id}</TableCell>
              <TableCell>{design.createdAt.toLocaleString()}</TableCell>
              <TableCell>{design.lastModified.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { api } from "@/trpc/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateDiagramButton } from "./CreateDiagramButton";
import Link from "next/link";
import { Route } from "next";

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
            <TableCell>Export</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designs.map((design) => (
            <TableRow key={design.id}>
              <TableCell>
                <Link href={`/admin/media/diagrams/${design.id}` as Route}>
                  {design.id}
                </Link>
              </TableCell>
              <TableCell>{design.createdAt.toLocaleString()}</TableCell>
              <TableCell>{design.lastModified.toLocaleString()}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

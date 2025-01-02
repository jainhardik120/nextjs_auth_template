"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useEffect, useState } from "react";
import { Design } from "@/canva-client";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";

const OnGoingExportButton: React.FC<{ exportId: string }> = ({ exportId }) => {
  const mutation = api.canva.refreshExportStatus.useMutation();
  return (
    <Button
      onClick={async () => {
        await mutation.mutate(exportId);
      }}
    >
      Refresh Status
    </Button>
  );
};

const OnGoingExportsList: React.FC<{ designId: string }> = ({ designId }) => {
  const { data, isFetching, refetch } =
    api.canva.listExports.useQuery(designId);
  return (
    <div>
      <ul>
        {data &&
          data.map((item) => {
            return (
              <li key={item.exportId}>
                <OnGoingExportButton exportId={item.exportId} />
                {item.status}
              </li>
            );
          })}
      </ul>
      <Button
        onClick={() => {
          refetch();
        }}
        disabled={isFetching}
      >
        {isFetching ? "Loading..." : "Refresh"}
      </Button>
    </div>
  );
};

const DesignExportButton: React.FC<{ designId: string }> = ({ designId }) => {
  const mutation = api.canva.exportDesign.useMutation({
    onSuccess: (response) => {
      console.log(response);
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Exports</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div>
          {/* Display list of previous exports, stored in S3 Bucket as images */}
          <OnGoingExportsList designId={designId} />
          <Button
            onClick={async () => {
              mutation.mutate({ designId });
            }}
          >
            Create new Export
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const DesignTable: React.FC<{ designs: Design[] }> = ({ designs }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Updated At</TableHead>
          <TableHead>Thumbnail</TableHead>
          <TableHead>Pages</TableHead>
          <TableHead>Edit</TableHead>
          <TableHead>Export</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {designs.map((design) => (
          <TableRow key={design.id}>
            <TableCell>{design.id}</TableCell>
            <TableCell>{design.title || "Untitled"}</TableCell>

            <TableCell>
              {new Date(design.created_at * 1000).toLocaleString()}
            </TableCell>
            <TableCell>
              {new Date(design.updated_at * 1000).toLocaleString()}
            </TableCell>
            <TableCell>
              {design.thumbnail ? (
                <Image
                  src={design.thumbnail?.url}
                  alt={`${design.title || "Untitled"} Thumbnail`}
                  className="object-cover rounded-md"
                  width="64"
                  height="96"
                />
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>{design.page_count || "-"}</TableCell>
            <TableCell>
              <Button
                onClick={() => window.open(design.urls.edit_url, "_blank")}
                disabled={!design.urls.edit_url}
              >
                Edit in Canva
              </Button>
            </TableCell>
            <TableCell>
              <DesignExportButton designId={design.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const designSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  height: z
    .string()
    .regex(/^\d+$/, "Height must be a positive number")
    .transform(Number)
    .refine((val) => val > 0, "Height must be greater than 0"),
  width: z
    .string()
    .regex(/^\d+$/, "Width must be a positive number")
    .transform(Number)
    .refine((val) => val > 0, "Width must be greater than 0"),
});

type DesignFormData = z.infer<typeof designSchema>;

const CreateDesignForm: React.FC<{
  onUpdateDesigns: (design: Design) => void;
}> = ({ onUpdateDesigns }) => {
  const form = useForm<DesignFormData>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      name: "",
      height: 0,
      width: 0,
    },
  });

  const { mutate: createDesign } = api.canva.createDesign.useMutation({
    onSuccess: (response) => {
      toast.success("Design created successfully");
      onUpdateDesigns(response.design);
      form.reset();
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const onSubmit = (data: DesignFormData) => {
    createDesign({
      name: data.name,
      height: data.height,
      width: data.width,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Create new design</Button>
      </PopoverTrigger>
      <PopoverContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter design name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter height"
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter width"
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};

const DesignList = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [continuation, setContinuation] = useState<string | undefined>(
    undefined,
  );
  const { data, isFetching, refetch } = api.canva.getUserDesigns.useQuery(
    { continuation },
    { enabled: false },
  );

  useEffect(() => {
    if (data) {
      setDesigns((prev) => [...prev, ...(data.items || [])]);
      setContinuation(data.continuation || undefined);
    }
  }, [data]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2>Designs</h2>
        <CreateDesignForm
          onUpdateDesigns={(design) => {
            setDesigns([design, ...designs]);
          }}
        />
      </div>
      <DesignTable designs={designs} />
      {continuation && (
        <div className="flex justify-center">
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DesignList;

import { Button } from "@/components/ui/button";
import { importExcalidraw } from "@/lib/excalidraw";
import { trpc } from "@/trpc/pages";
import { exportToBlob } from "@excalidraw/excalidraw";
import {
  BinaryFileData,
  BinaryFiles,
} from "@excalidraw/excalidraw/types/types";
import React, { useEffect } from "react";

const ExportButton = ({ id }: { id: string }) => {
  const { data, refetch } = trpc.excalidraw.getSignedUrlDesign.useQuery(
    { id },
    { enabled: false },
  );

  useEffect(() => {
    if (data === undefined) return;
    console.log("Fetching data");
    importExcalidraw(data.elementsUrl, data.filesUrl).then(
      async (importedData) => {
        const binaryFiles: BinaryFiles = importedData.files.reduce<
          Record<string, BinaryFileData>
        >((acc, file, index) => {
          acc[index] = file;
          return acc;
        }, {});
        const blob = await exportToBlob({
          elements: importedData.elements,
          files: binaryFiles,
          mimeType: "image/jpeg",
          quality: 1,
          exportPadding: 10,
        });
        console.log(blob);
      },
    );
  }, [data]);
  return (
    <Button
      onClick={() => {
        refetch();
      }}
    >
      Export
    </Button>
  );
};

export default ExportButton;

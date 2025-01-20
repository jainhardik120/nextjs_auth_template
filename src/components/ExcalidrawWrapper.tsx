import "@/styles/globals.css";
import {
  BinaryFileData,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types/types";
import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";
import {
  ExcalidrawElement,
  Theme,
} from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImportData } from "@/lib/excalidraw";
import { trpc } from "@/trpc/pages";
import { useDebouncedCallback } from "use-debounce";
import _ from "lodash";

export default function ExcalidrawWrapper({
  id,
  initialData,
}: {
  id: string;
  initialData: ExcalidrawImportData;
}) {
  const [excalidrawApi, setExcalidrawApi] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const { resolvedTheme } = useTheme();

  const [previousFiles, setPreviousFiles] = useState<BinaryFileData[]>(
    _.cloneDeep(initialData.files),
  );
  const [previousElements, setPreviousElements] = useState<ExcalidrawElement[]>(
    _.cloneDeep(initialData.elements),
  );

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!excalidrawApi) return;
    try {
      excalidrawApi.addFiles(initialData.files);
      excalidrawApi.updateScene({ elements: initialData.elements });
    } catch (error) {
      console.error("Error importing and updating scene:", error);
    }

    setDataLoaded(true);

    const files = excalidrawApi.getFiles();
    setPreviousFiles(Object.values(files).map((file) => _.cloneDeep(file)));
    setPreviousElements(
      _.cloneDeep(
        excalidrawApi.getSceneElementsIncludingDeleted() as ExcalidrawElement[],
      ),
    );
  }, [excalidrawApi, initialData]);

  const signedUrlForPut = trpc.excalidraw.getSignedUrlForPutFiles.useMutation();

  const updateElementsMutation = trpc.excalidraw.updateElements.useMutation();

  const handleFileChange = useDebouncedCallback(
    async (updatedFiles: BinaryFileData[]) => {
      try {
        const signedUrl = await signedUrlForPut.mutateAsync({ id });
        await fetch(signedUrl ?? "", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: updatedFiles }),
        });
      } catch (error) {
        console.error("Error uploading updated files:", error);
      }
    },
    1000,
  );

  const handleElementsChange = useDebouncedCallback(
    async (updatedElements: ExcalidrawElement[]) => {
      try {
        await updateElementsMutation.mutateAsync({
          id,
          elements: JSON.stringify(updatedElements),
        });
      } catch (error) {
        console.error("Error updating elements:", error);
      }
    },
    1000,
  );

  const debouncedUpdates = useDebouncedCallback(
    (elements: readonly ExcalidrawElement[], files: BinaryFiles) => {
      if (!dataLoaded) return;
      const newFiles: BinaryFileData[] = Object.values(files).map((file) =>
        _.cloneDeep(file),
      );
      if (!_.isEqual(newFiles, previousFiles)) {
        setPreviousFiles(newFiles);
        handleFileChange(newFiles);
      }
      const newElements: ExcalidrawElement[] = _.cloneDeep(
        elements as ExcalidrawElement[],
      );
      if (!_.isEqual(newElements, previousElements)) {
        setPreviousElements(newElements);
        handleElementsChange(newElements);
      }
    },
    500,
  );

  return (
    <Excalidraw
      excalidrawAPI={(api) => setExcalidrawApi(api)}
      onChange={(elements, appstate, files) => {
        debouncedUpdates(elements, files);
      }}
      theme={resolvedTheme as Theme}
    />
  );
}

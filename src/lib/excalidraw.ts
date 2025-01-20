import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import {
  BinaryFiles,
  BinaryFileData,
} from "@excalidraw/excalidraw/types/types";

export const exportExcalidraw = async (
  elements: readonly ExcalidrawElement[],
  files: BinaryFiles,
): Promise<void> => {
  const filesArray: BinaryFileData[] = Object.values(files).map((file) => ({
    ...file,
  }));

  const excalidrawData = JSON.stringify({ elements, files: filesArray });
  try {
    localStorage.setItem("excalidrawData", excalidrawData);
  } catch (error) {
    console.error("Error saving data:", error);
    throw error;
  }
};

export type ExcalidrawImportData = {
  elements: ExcalidrawElement[];
  files: BinaryFileData[];
};

export const importExcalidraw = async (
  elementsUrl: string,
  filesUrl: string,
): Promise<ExcalidrawImportData> => {
  if (!elementsUrl || !filesUrl) {
    throw new Error("Both elementsUrl and filesUrl are required.");
  }
  try {
    const elementsResponse = await fetch(elementsUrl);
    if (!elementsResponse.ok) {
      throw new Error(
        `Failed to fetch elements file. Status: ${elementsResponse.status}`,
      );
    }
    const elementsData = await elementsResponse.json();
    const filesResponse = await fetch(filesUrl);
    if (!filesResponse.ok) {
      throw new Error(
        `Failed to fetch files file. Status: ${filesResponse.status}`,
      );
    }
    const filesData = await filesResponse.json();
    const combinedData: ExcalidrawImportData = {
      elements: elementsData.elements || [],
      files: filesData.files || [],
    };
    return combinedData;
  } catch (error) {
    console.error("Error fetching or parsing the JSON files:", error);
    throw new Error("Failed to import Excalidraw data.");
  }
};

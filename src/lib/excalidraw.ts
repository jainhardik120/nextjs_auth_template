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
    console.log("Data successfully saved to localStorage.");
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
  signedUrl: string,
): Promise<ExcalidrawImportData> => {
  if (!signedUrl) {
    throw new Error("Signed URL is required.");
  }
  console.log("Signed URL:", signedUrl);
  try {
    const response = await fetch(signedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch the file. Status: ${response.status}`);
    }
    const excalidrawData = await response.json();
    return excalidrawData;
  } catch (error) {
    console.error("Error fetching or parsing the JSON file:", error);
    throw new Error("Failed to import Excalidraw data.");
  }
};

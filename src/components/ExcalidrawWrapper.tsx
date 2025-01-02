"use client";

import "@/styles/globals.css";
import { MainMenu } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { useCallback, useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";
import { Theme } from "@excalidraw/excalidraw/types/element/types";
import { ExcalidrawImportData, exportExcalidraw } from "@/lib/excalidraw";

export default function ExcalidrawWrapper({
  initialData,
}: {
  initialData: ExcalidrawImportData;
}) {
  const [excalidrawApi, setExcalidrawApi] =
    useState<ExcalidrawImperativeAPI | null>(null);
  const { resolvedTheme } = useTheme();

  const importAndUpdateScene = useCallback(async () => {
    if (!excalidrawApi) {
      return;
    }
    try {
      excalidrawApi.addFiles(initialData.files);
      excalidrawApi.updateScene({ elements: initialData.elements });
    } catch (error) {
      console.error("Error importing and updating scene:", error);
    }
  }, [excalidrawApi, initialData]);

  useEffect(() => {
    importAndUpdateScene();
  }, [importAndUpdateScene]);

  return (
    <Excalidraw
      excalidrawAPI={(api) => setExcalidrawApi(api)}
      theme={resolvedTheme as Theme}
    >
      <MainMenu>
        <MainMenu.Item
          onSelect={() => {
            if (!excalidrawApi) {
              return;
            }
            const elements = excalidrawApi.getSceneElements();
            const files = excalidrawApi.getFiles();
            exportExcalidraw(elements, files);
          }}
        >
          Create Export
        </MainMenu.Item>
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.DefaultItems.ClearCanvas />
        <MainMenu.DefaultItems.ChangeCanvasBackground />
      </MainMenu>
    </Excalidraw>
  );
}

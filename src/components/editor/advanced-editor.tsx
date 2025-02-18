"use client";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  type JSONContent,
  EditorCommandList,
  EditorBubble,
  EditorInstance,
} from "novel";
import { ImageResizer, handleCommandNavigation } from "novel/extensions";
import { defaultExtensions } from "./extensions";
import { NodeSelector } from "./selectors/node-selector";
import { LinkSelector } from "./selectors/link-selector";
import { ColorSelector } from "./selectors/color-selector";

import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { handleImageDrop, handleImagePaste } from "novel/plugins";
import { uploadFn } from "./image-upload";
import { Separator } from "../ui/separator";

import "@/styles/prosemirror.css";

import { useDebouncedCallback } from "use-debounce";

const extensions = [...defaultExtensions, slashCommand];
import "highlight.js/styles/atom-one-dark.css";

interface EditorProp {
  initialValue?: JSONContent;
  onChange: (value: JSONContent) => Promise<void>;
}

export interface EditorRef {
  setContent: (content: string) => void;
  getJSON: () => JSONContent | null;
}

const Editor = forwardRef<EditorRef, EditorProp>(
  ({ initialValue, onChange }, ref) => {
    const [openNode, setOpenNode] = useState(false);
    const [openColor, setOpenColor] = useState(false);
    const [openLink, setOpenLink] = useState(false);
    const [editorInstance, setEditorInstance] = useState<EditorInstance | null>(
      null,
    );

    const debouncedUpdates = useDebouncedCallback(
      async (editor: EditorInstance) => {
        const json = editor.getJSON();
        await onChange(json);
      },
      500,
    );

    useImperativeHandle(ref, () => ({
      setContent: (content: string) => {
        if (editorInstance) {
          editorInstance.chain().clearContent().insertContent(content).run();
        }
      },
      getJSON: () => {
        if (editorInstance) {
          return editorInstance.getJSON();
        }
        return null;
      },
    }));

    useEffect(() => {
      console.log(initialValue);
    }, [initialValue]);

    return (
      <EditorRoot>
        <EditorContent
          {...(initialValue && { initialContent: initialValue })}
          extensions={extensions}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            handlePaste: (view, event) =>
              handleImagePaste(view, event, uploadFn),
            handleDrop: (view, event, _slice, moved) =>
              handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full border`,
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
          }}
          onCreate={({ editor }) => {
            setEditorInstance(editor);
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-muted-foreground">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent `}
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </EditorCommandItem>
              ))}
            </EditorCommandList>
          </EditorCommand>

          <EditorBubble
            tippyOptions={{
              placement: "top",
            }}
            className="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
          >
            <Separator orientation="vertical" />
            <NodeSelector open={openNode} onOpenChange={setOpenNode} />
            <Separator orientation="vertical" />
            <LinkSelector open={openLink} onOpenChange={setOpenLink} />
            <Separator orientation="vertical" />
            <TextButtons />
            <Separator orientation="vertical" />
            <ColorSelector open={openColor} onOpenChange={setOpenColor} />
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
    );
  },
);

Editor.displayName = "Editor";

export default Editor;

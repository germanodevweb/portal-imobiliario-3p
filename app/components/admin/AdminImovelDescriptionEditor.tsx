"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";
import { plainTextToDescriptionHtml } from "@/lib/utils/admin-description-html";

function toolbarButtonClass(active: boolean): string {
  return `inline-flex h-9 min-w-9 items-center justify-center rounded-md border text-zinc-700 transition-colors ${
    active
      ? "border-green-600 bg-green-50 text-green-800"
      : "border-transparent bg-white hover:bg-zinc-100"
  }`;
}

type AlignButtonProps = {
  editor: Editor;
  align: "left" | "center" | "right" | "justify";
  title: string;
  children: ReactNode;
};

function AlignButton({ editor, align, title, children }: AlignButtonProps) {
  const active = editor.isActive({ textAlign: align });
  return (
    <button
      type="button"
      onClick={() => editor.chain().focus().setTextAlign(align).run()}
      className={toolbarButtonClass(active)}
      title={title}
      aria-label={title}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export type AdminImovelDescriptionEditorProps = {
  name: string;
  initialHtml: string;
  placeholder?: string;
};

/**
 * Editor rico (TipTap) para a descrição do imóvel no admin.
 * O valor enviado ao servidor é HTML (campo oculto sincronizado em cada atualização).
 */
export function AdminImovelDescriptionEditor({
  name,
  initialHtml,
  placeholder = "Descreva o imóvel. Use negrito, títulos e listas para organizar o texto.",
}: AdminImovelDescriptionEditorProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);
  const initialContent = plainTextToDescriptionHtml(initialHtml);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "tiptap max-w-none min-h-[220px] px-3 py-3 text-sm leading-relaxed text-zinc-900 focus:outline-none [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_p]:my-2 [&_li]:my-0.5",
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (hiddenRef.current) {
        hiddenRef.current.value = ed.getHTML();
      }
    },
  });

  useEffect(() => {
    if (!editor || !hiddenRef.current) return;
    hiddenRef.current.value = editor.getHTML();
  }, [editor]);

  if (!editor) {
    return (
      <>
        <input
          ref={hiddenRef}
          type="hidden"
          name={name}
          defaultValue={initialContent}
          readOnly
          aria-hidden
        />
        <div className="min-h-[280px] rounded-lg border border-zinc-200 bg-zinc-50 animate-pulse" />
      </>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600">
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={initialContent}
        readOnly
        aria-hidden
      />
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-2"
        role="toolbar"
        aria-label="Formatação da descrição"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarButtonClass(editor.isActive("bold"))}
          title="Negrito"
          aria-label="Negrito"
          aria-pressed={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarButtonClass(editor.isActive("italic"))}
          title="Itálico"
          aria-label="Itálico"
          aria-pressed={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" aria-hidden />
        </button>
        <span className="mx-1 h-6 w-px bg-zinc-200" aria-hidden />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarButtonClass(editor.isActive("heading", { level: 2 }))}
          title="Título nível 2"
          aria-label="Título nível 2"
          aria-pressed={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={toolbarButtonClass(
            editor.isActive("paragraph") && !editor.isActive("heading")
          )}
          title="Parágrafo"
          aria-label="Parágrafo"
          aria-pressed={
            editor.isActive("paragraph") && !editor.isActive("heading")
          }
        >
          <span className="px-1 text-xs font-medium" aria-hidden>
            ¶
          </span>
        </button>
        <span className="mx-1 h-6 w-px bg-zinc-200" aria-hidden />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClass(editor.isActive("bulletList"))}
          title="Lista com marcadores"
          aria-label="Lista com marcadores"
          aria-pressed={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarButtonClass(editor.isActive("orderedList"))}
          title="Lista numerada"
          aria-label="Lista numerada"
          aria-pressed={editor.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" aria-hidden />
        </button>
        <span className="mx-1 h-6 w-px bg-zinc-200" aria-hidden />
        <AlignButton editor={editor} align="left" title="Alinhar à esquerda">
          <AlignLeft className="h-4 w-4" aria-hidden />
        </AlignButton>
        <AlignButton editor={editor} align="center" title="Centralizar">
          <AlignCenter className="h-4 w-4" aria-hidden />
        </AlignButton>
        <AlignButton editor={editor} align="right" title="Alinhar à direita">
          <AlignRight className="h-4 w-4" aria-hidden />
        </AlignButton>
        <AlignButton editor={editor} align="justify" title="Justificar">
          <AlignJustify className="h-4 w-4" aria-hidden />
        </AlignButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

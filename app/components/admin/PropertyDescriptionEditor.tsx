"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Minus,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import { plainTextToDescriptionHtml } from "@/lib/utils/admin-description-html";

type PropertyDescriptionEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function toolbarButtonClass(active: boolean): string {
  return `inline-flex h-9 min-w-9 items-center justify-center rounded-md border text-zinc-700 transition-colors ${
    active
      ? "border-green-600 bg-green-50 text-green-800"
      : "border-transparent bg-white hover:bg-zinc-100"
  }`;
}

/**
 * Editor rico (TipTap) para a descrição do imóvel no admin.
 * O valor enviado ao servidor é HTML.
 */
export function PropertyDescriptionEditor({
  value,
  onChange,
  placeholder = "Descreva o imóvel. Use negrito, títulos e listas para organizar o texto.",
}: PropertyDescriptionEditorProps) {
  const lastExternalValue = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: plainTextToDescriptionHtml(value),
    editorProps: {
      attributes: {
        class:
          "tiptap max-w-none min-h-[260px] px-3 py-3 text-sm leading-relaxed text-zinc-900 focus:outline-none [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_hr]:my-4 [&_hr]:border-zinc-200 [&_p]:my-2 [&_li]:my-0.5",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastExternalValue.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const normalized = plainTextToDescriptionHtml(value);
    if (normalized === lastExternalValue.current) return;
    editor.commands.setContent(normalized, false);
    lastExternalValue.current = editor.getHTML();
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-[300px] rounded-lg border border-zinc-200 bg-zinc-50 animate-pulse" />
    );
  }

  return (
    <div className="property-description-editor overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm focus-within:border-green-600 focus-within:ring-1 focus-within:ring-green-600">
      <div
        className="flex max-w-full flex-wrap items-center gap-0.5 overflow-x-auto border-b border-zinc-200 bg-zinc-50 px-2 py-2"
        role="toolbar"
        aria-label="Formatação da descrição"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarButtonClass(editor.isActive("bold"))}
          title="Negrito"
          aria-pressed={editor.isActive("bold")}
        >
          <Bold className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarButtonClass(editor.isActive("italic"))}
          title="Itálico"
          aria-pressed={editor.isActive("italic")}
        >
          <Italic className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarButtonClass(editor.isActive("underline"))}
          title="Sublinhado"
          aria-pressed={editor.isActive("underline")}
        >
          <UnderlineIcon className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={toolbarButtonClass(editor.isActive("strike"))}
          title="Riscado"
          aria-pressed={editor.isActive("strike")}
        >
          <Strikethrough className="h-4 w-4" aria-hidden />
        </button>
        <span className="mx-1 h-6 w-px shrink-0 bg-zinc-200" aria-hidden />
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={toolbarButtonClass(
            editor.isActive("heading", { level: 2 })
          )}
          title="Título nível 2"
          aria-pressed={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={toolbarButtonClass(
            editor.isActive("heading", { level: 3 })
          )}
          title="Título nível 3"
          aria-pressed={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={toolbarButtonClass(
            editor.isActive("paragraph") && !editor.isActive("heading")
          )}
          title="Parágrafo"
          aria-pressed={
            editor.isActive("paragraph") && !editor.isActive("heading")
          }
        >
          <span className="px-1 text-xs font-medium">¶</span>
        </button>
        <span className="mx-1 h-6 w-px shrink-0 bg-zinc-200" aria-hidden />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClass(editor.isActive("bulletList"))}
          title="Lista com marcadores"
          aria-pressed={editor.isActive("bulletList")}
        >
          <List className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarButtonClass(editor.isActive("orderedList"))}
          title="Lista numerada"
          aria-pressed={editor.isActive("orderedList")}
        >
          <ListOrdered className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-transparent bg-white text-zinc-700 hover:bg-zinc-100"
          title="Linha horizontal"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <span className="mx-1 h-6 w-px shrink-0 bg-zinc-200" aria-hidden />
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={toolbarButtonClass(editor.isActive({ textAlign: "left" }))}
          title="Alinhar à esquerda"
          aria-pressed={editor.isActive({ textAlign: "left" })}
        >
          <AlignLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={toolbarButtonClass(
            editor.isActive({ textAlign: "center" })
          )}
          title="Centralizar"
          aria-pressed={editor.isActive({ textAlign: "center" })}
        >
          <AlignCenter className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={toolbarButtonClass(editor.isActive({ textAlign: "right" }))}
          title="Alinhar à direita"
          aria-pressed={editor.isActive({ textAlign: "right" })}
        >
          <AlignRight className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={toolbarButtonClass(
            editor.isActive({ textAlign: "justify" })
          )}
          title="Justificar"
          aria-pressed={editor.isActive({ textAlign: "justify" })}
        >
          <AlignJustify className="h-4 w-4" aria-hidden />
        </button>
        <span className="mx-1 h-6 w-px shrink-0 bg-zinc-200" aria-hidden />
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md border border-transparent bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
          title="Desfazer"
        >
          <Undo className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md border border-transparent bg-white text-zinc-700 hover:bg-zinc-100 disabled:opacity-40"
          title="Refazer"
        >
          <Redo className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

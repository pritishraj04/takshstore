"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2 } from 'lucide-react';
import { useEffect } from 'react';

export function TipTapEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-indigo-600 underline cursor-pointer',
                },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[400px] px-6 py-4'
            }
        }
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return null;

    const toggleLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)
        if (url === null) return // cancelled
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col h-full">
            <div className="flex flex-wrap items-center gap-1.5 p-2 px-4 border-b border-gray-100 bg-gray-50/50">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-200'}`}
                    title="Bold"
                >
                    <Bold className="w-[18px] h-[18px]" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-200'}`}
                    title="Italic"
                >
                    <Italic className="w-[18px] h-[18px]" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-2 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-200'}`}
                    title="Heading 2"
                >
                    <Heading2 className="w-[18px] h-[18px]" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-200'}`}
                    title="Bullet List"
                >
                    <List className="w-[18px] h-[18px]" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-200'}`}
                    title="Ordered List"
                >
                    <ListOrdered className="w-[18px] h-[18px]" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                    onClick={toggleLink}
                    className={`p-2 rounded-lg transition-colors ${editor.isActive('link') ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-gray-200'}`}
                    title="Link"
                >
                    <LinkIcon className="w-[18px] h-[18px]" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-white">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

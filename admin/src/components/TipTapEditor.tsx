'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Minus,
  Code2,
  Undo,
  Redo,
  FileCode,
  Eye,
  Link as LinkIcon,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
  RemoveFormatting,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

const HTML_STRIP_REGEX = /<[^>]*>/g;
const WHITESPACE_SPLIT_REGEX = /\s+/;

const PRESET_COLORS = [
  { label: 'Default Slate', color: '#1e293b' },
  { label: 'Brand Gold', color: '#b8892d' },
  { label: 'Deep Wood', color: '#543724' },
  { label: 'Warm Amber', color: '#d97706' },
  { label: 'Forest Green', color: '#059669' },
  { label: 'Ruby Red', color: '#e11d48' },
  { label: 'Sapphire Blue', color: '#2563eb' },
];

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  badge?: string;
  badgeColor?: 'slate' | 'emerald';
  minHeight?: string;
}

const ToolbarButton: React.FC<{
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, isActive, disabled, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-all cursor-pointer ${
      isActive
        ? 'bg-[#c08a46] text-white shadow-2xs font-bold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
    } disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

export default function TipTapEditor({
  value,
  onChange,
  placeholder = 'Write rich content here...',
  label,
  badge,
  badgeColor = 'slate',
  minHeight = '180px',
}: TipTapEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value || '');

  // Link input popover state
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Color picker popover state
  const [showColorPicker, setShowColorPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        dropcursor: {
          color: '#c08a46',
          width: 2,
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'tiptap-link',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Enter heading...';
          }
          return placeholder;
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'tiptap ProseMirror tiptap-content focus:outline-none p-4 text-slate-800 text-sm leading-relaxed',
        style: `min-height: ${minHeight};`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const cleanHtml = html === '<p></p>' ? '' : html;
      setHtmlSource(cleanHtml);
      onChange(cleanHtml);
    },
  });

  // Safe external value synchronization without cursor jumping
  useEffect(() => {
    if (!editor || isHtmlMode) return;

    // Never overwrite while user is actively focused and typing in the editor
    if (editor.isFocused) return;

    const currentHtml = editor.getHTML();
    const cleanVal = value || '';
    const isBothEmpty =
      (!cleanVal || cleanVal === '<p></p>') &&
      (!currentHtml || currentHtml === '<p></p>');

    if (!isBothEmpty && cleanVal !== currentHtml) {
      editor.commands.setContent(cleanVal, { emitUpdate: false });
      setHtmlSource(cleanVal);
    }
  }, [value, editor, isHtmlMode]);

  const handleHtmlSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlSource(val);
    onChange(val);
  };

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      if (editor) {
        editor.commands.setContent(htmlSource, { emitUpdate: false });
      }
      setIsHtmlMode(false);
    } else {
      if (editor) {
        setHtmlSource(editor.getHTML());
      }
      setIsHtmlMode(true);
    }
  };

  // Link Dialog Handlers
  const openLinkModal = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 60);
  };

  const applyLink = () => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    let formattedUrl = linkUrl.trim();
    if (
      !/^https?:\/\//i.test(formattedUrl) &&
      !formattedUrl.startsWith('/') &&
      !formattedUrl.startsWith('#') &&
      !formattedUrl.startsWith('mailto:')
    ) {
      formattedUrl = 'https://' + formattedUrl;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl }).run();
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl('');
  };

  // Word and character stats
  const { wordCount, charCount } = useMemo(() => {
    const text = (htmlSource || '').replace(HTML_STRIP_REGEX, '').trim();
    return {
      wordCount: text ? text.split(WHITESPACE_SPLIT_REGEX).length : 0,
      charCount: text.length,
    };
  }, [htmlSource]);

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs focus-within:border-[#c08a46] transition-colors">
      {/* Optional Top Label & Language Badge Header */}
      {label && (
        <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">{label}</span>
          {badge && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                badgeColor === 'emerald'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Main Formatting Toolbar */}
      <div className="p-1.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between gap-1 flex-wrap text-xs select-none">
        <div className="flex items-center gap-0.5 flex-wrap">
          {/* History */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo() || isHtmlMode}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo() || isHtmlMode}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5" />
          </ToolbarButton>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Text Style */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
            disabled={isHtmlMode}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
            disabled={isHtmlMode}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            isActive={editor?.isActive('underline')}
            disabled={isHtmlMode}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            isActive={editor?.isActive('strike')}
            disabled={isHtmlMode}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => (editor?.chain().focus() as any).toggleHighlight().run()}
            isActive={editor?.isActive('highlight')}
            disabled={isHtmlMode}
            title="Highlight Text"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleCode().run()}
            isActive={editor?.isActive('code')}
            disabled={isHtmlMode}
            title="Inline Code"
          >
            <Code className="w-3.5 h-3.5" />
          </ToolbarButton>

          {/* Color Picker Dropdown Toggle */}
          <div className="relative inline-block">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              disabled={isHtmlMode}
              title="Text Color"
            >
              <Palette className="w-3.5 h-3.5 text-[#c08a46]" />
            </ToolbarButton>

            {showColorPicker && (
              <div
                className="absolute top-full left-0 mt-1 p-2 bg-white rounded-xl shadow-lg border border-slate-200 z-50 flex items-center gap-1.5"
                onMouseDown={(e) => e.preventDefault()}
              >
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    title={c.label}
                    onClick={() => {
                      if (c.color === '#1e293b') {
                        (editor?.chain().focus() as any).unsetColor().run();
                      } else {
                        (editor?.chain().focus() as any).setColor(c.color).run();
                      }
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform cursor-pointer"
                    style={{ backgroundColor: c.color }}
                  />
                ))}
                <button
                  type="button"
                  title="Clear Color"
                  onClick={() => {
                    (editor?.chain().focus() as any).unsetColor().run();
                    setShowColorPicker(false);
                  }}
                  className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-800 rounded bg-slate-100"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().setParagraph().run()}
            isActive={editor?.isActive('paragraph') && !editor?.isActive('heading')}
            disabled={isHtmlMode}
            title="Normal Paragraph"
          >
            <Pilcrow className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor?.isActive('heading', { level: 1 })}
            disabled={isHtmlMode}
            title="Heading 1"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor?.isActive('heading', { level: 2 })}
            disabled={isHtmlMode}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor?.isActive('heading', { level: 3 })}
            disabled={isHtmlMode}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </ToolbarButton>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => (editor?.chain().focus() as any).setTextAlign('left').run()}
            isActive={editor?.isActive({ textAlign: 'left' })}
            disabled={isHtmlMode}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => (editor?.chain().focus() as any).setTextAlign('center').run()}
            isActive={editor?.isActive({ textAlign: 'center' })}
            disabled={isHtmlMode}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => (editor?.chain().focus() as any).setTextAlign('right').run()}
            isActive={editor?.isActive({ textAlign: 'right' })}
            disabled={isHtmlMode}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => (editor?.chain().focus() as any).setTextAlign('justify').run()}
            isActive={editor?.isActive({ textAlign: 'justify' })}
            disabled={isHtmlMode}
            title="Align Justify"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </ToolbarButton>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Lists & Blocks */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList')}
            disabled={isHtmlMode}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList')}
            disabled={isHtmlMode}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            isActive={editor?.isActive('blockquote')}
            disabled={isHtmlMode}
            title="Blockquote"
          >
            <Quote className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            disabled={isHtmlMode}
            title="Horizontal Divider Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            isActive={editor?.isActive('codeBlock')}
            disabled={isHtmlMode}
            title="Code Block"
          >
            <Code2 className="w-3.5 h-3.5" />
          </ToolbarButton>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Hyperlinks */}
          <ToolbarButton
            onClick={openLinkModal}
            isActive={editor?.isActive('link')}
            disabled={isHtmlMode}
            title={editor?.isActive('link') ? 'Edit / Remove Link' : 'Insert Link'}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </ToolbarButton>

          {/* Clear Formatting */}
          <ToolbarButton
            onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
            disabled={isHtmlMode}
            title="Clear Formatting"
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </ToolbarButton>
        </div>

        {/* HTML Source Toggle Button */}
        <button
          type="button"
          onClick={toggleHtmlMode}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
            isHtmlMode
              ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
          }`}
          title="Toggle HTML Source Code View"
        >
          {isHtmlMode ? (
            <>
              <Eye className="w-3 h-3 text-amber-700" />
              <span>WYSIWYG</span>
            </>
          ) : (
            <>
              <FileCode className="w-3 h-3 text-[#c08a46]" />
              <span>&lt;/&gt; HTML</span>
            </>
          )}
        </button>
      </div>

      {/* Inline Link Toolbar Bar */}
      {showLinkInput && (
        <div
          className="p-2.5 bg-amber-50/90 border-b border-amber-200 flex items-center gap-2 flex-wrap text-xs animate-in fade-in duration-150"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <span className="font-bold text-amber-900 flex items-center gap-1">
            <LinkIcon className="w-3.5 h-3.5 text-[#c08a46]" />
            <span>URL:</span>
          </span>
          <input
            ref={linkInputRef}
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              } else if (e.key === 'Escape') {
                setShowLinkInput(false);
              }
            }}
            placeholder="https://example.com"
            className="flex-1 min-w-[200px] px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs text-slate-900 focus:outline-none focus:border-[#c08a46]"
          />
          <button
            type="button"
            onClick={applyLink}
            className="px-2.5 py-1 rounded-lg bg-[#c08a46] hover:bg-[#a87435] text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Apply</span>
          </button>
          {editor?.isActive('link') && (
            <button
              type="button"
              onClick={removeLink}
              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 border border-rose-200 transition-colors cursor-pointer"
            >
              <Unlink className="w-3 h-3" />
              <span>Unlink</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Body */}
      {isHtmlMode ? (
        <textarea
          value={htmlSource}
          onChange={handleHtmlSourceChange}
          placeholder="Enter raw HTML markup here..."
          className="w-full p-4 text-xs font-mono bg-slate-900 text-amber-100 focus:outline-none resize-y leading-relaxed"
          style={{ minHeight }}
        />
      ) : (
        <EditorContent editor={editor} />
      )}

      {/* Footer Word & Character Counter */}
      <div className="px-3.5 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>{isHtmlMode ? 'HTML Source Mode' : 'TipTap Visual Editor'}</span>
        <span>
          {wordCount} words &bull; {charCount} chars
        </span>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Editor, EditorState, RichUtils, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  editorState: EditorState;
  onChange: (editorState: EditorState) => void;
  placeholder?: string;
}

const StyleButton = ({ onToggle, style, active, children }: { onToggle: (style: string) => void, style: string, active: boolean, children: React.ReactNode }) => {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", active && "bg-muted")}
            onMouseDown={(e) => {
                e.preventDefault();
                onToggle(style);
            }}
        >
            {children}
        </Button>
    );
};

const BLOCK_TYPES = [
    { label: 'UL', style: 'unordered-list-item', icon: <List /> },
    { label: 'OL', style: 'ordered-list-item', icon: <ListOrdered /> },
];

const INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD', icon: <Bold /> },
    { label: 'Italic', style: 'ITALIC', icon: <Italic /> },
    { label: 'Underline', style: 'UNDERLINE', icon: <Underline /> },
];


export const RichTextEditor: React.FC<RichTextEditorProps> = ({ editorState, onChange, placeholder }) => {
  const editorRef = React.useRef<Editor>(null);

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const keyBindingFn = (e: React.KeyboardEvent<{}>): string | null => {
      return getDefaultKeyBinding(e);
  }

  const toggleBlockType = (blockType: string) => {
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle: string) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const currentStyle = editorState.getCurrentInlineStyle();
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();
    
  React.useEffect(() => {
    // Focus the editor when the component mounts if it's not already focused.
    if (editorRef.current) {
        // editorRef.current.focus();
    }
  }, []);

  return (
    <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <div className="p-1 border-b">
        <div className="flex items-center gap-1">
            {INLINE_STYLES.map(type =>
                <StyleButton key={type.label} active={currentStyle.has(type.style)} onToggle={toggleInlineStyle} style={type.style}>
                   {type.icon}
                </StyleButton>
            )}
            <Separator orientation="vertical" className="h-6 mx-1" />
            {BLOCK_TYPES.map(type =>
                <StyleButton key={type.label} active={type.style === blockType} onToggle={toggleBlockType} style={type.style}>
                   {type.icon}
                </StyleButton>
            )}
        </div>
      </div>
      <div className="p-3 min-h-[250px] cursor-text" onClick={() => editorRef.current?.focus()}>
        <Editor
            ref={editorRef}
            editorState={editorState}
            onChange={onChange}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={keyBindingFn}
            placeholder={placeholder}
            spellCheck={true}
        />
      </div>
    </div>
  );
};

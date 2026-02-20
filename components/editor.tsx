import type { Extension, Editor as TiptapEditor } from "@tiptap/core";
import Typography from "@tiptap/extension-typography";
import { Placeholder } from "@tiptap/extensions";
import StarterKit from "@tiptap/starter-kit";
import type { Component, JSX } from "solid-js";
import { createEffect, createSignal, onCleanup, Show, splitProps } from "solid-js";
import { createTiptapEditor } from "solid-tiptap";
import IconBold from "~icons/lucide/bold";
import IconCode from "~icons/lucide/code";
import IconCornerDownLeft from "~icons/lucide/corner-down-left";
import IconItalic from "~icons/lucide/italic";
import IconList from "~icons/lucide/list";
import IconListOrdered from "~icons/lucide/list-ordered";
import IconMinus from "~icons/lucide/minus";
import IconQuote from "~icons/lucide/quote";
import IconRedo from "~icons/lucide/redo";
import IconSquareCode from "~icons/lucide/square-code";
import IconStrikethrough from "~icons/lucide/strikethrough";
import IconUnderline from "~icons/lucide/underline";
import IconUndo from "~icons/lucide/undo";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export interface EditorProps {
	/** Initial content (HTML or JSON) */
	content?: string;
	/** Placeholder text when editor is empty */
	placeholder?: string;
	/** Whether the editor is editable */
	editable?: boolean;
	/** Show/hide the toolbar */
	showToolbar?: boolean;
	/** Additional CSS classes */
	class?: string;
	/** Minimum height */
	minHeight?: string;
	/** Maximum height */
	maxHeight?: string;
	/** Callback when content changes */
	onChange?: (html: string) => void;
	/** Callback when editor is ready */
	onReady?: (editor: TiptapEditor) => void;
	/** Callback when editor gains focus */
	onFocus?: () => void;
	/** Callback when editor loses focus */
	onBlur?: () => void;
	/** Enable/disable specific extensions */
	extensions?: {
		link?: boolean;
		underline?: boolean;
		typography?: boolean;
	};
}

const ToolbarButton: Component<{
	onClick: () => void;
	active?: boolean;
	disabled?: boolean;
	title: string;
	children: JSX.Element;
}> = (props) => {
	return (
		<Tooltip openDelay={500}>
			<TooltipTrigger>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={props.onClick}
					disabled={props.disabled}
					toggle
					pressed={props.active}
					class="h-8 w-8"
				>
					{props.children}
				</Button>
			</TooltipTrigger>
			<TooltipContent>{props.title}</TooltipContent>
		</Tooltip>
	);
};

const Toolbar: Component<{ editor: () => TiptapEditor | undefined }> = (props) => {
	const [isBold, setIsBold] = createSignal(false);
	const [isItalic, setIsItalic] = createSignal(false);
	const [isStrike, setIsStrike] = createSignal(false);
	const [isUnderline, setIsUnderline] = createSignal(false);
	const [isCode, setIsCode] = createSignal(false);

	createEffect(() => {
		const editor = props.editor();
		if (!editor) return;

		const update = () => {
			setIsBold(editor.isActive("bold"));
			setIsItalic(editor.isActive("italic"));
			setIsStrike(editor.isActive("strike"));
			setIsUnderline(editor.isActive("underline"));
			setIsCode(editor.isActive("code"));
		};

		editor.on("selectionUpdate", update);
		editor.on("transaction", update);

		return () => {
			editor.off("selectionUpdate", update);
			editor.off("transaction", update);
		};
	});

	return (
		<div class="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
			{/* Text formatting */}
			<div class="flex gap-1">
				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleBold().run()}
					active={isBold()}
					title="Bold (Ctrl+B)"
				>
					<IconBold class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleItalic().run()}
					active={isItalic()}
					title="Italic (Ctrl+I)"
				>
					<IconItalic class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleUnderline().run()}
					active={isUnderline()}
					title="Underline (Ctrl+U)"
				>
					<IconUnderline class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleStrike().run()}
					active={isStrike()}
					title="Strikethrough"
				>
					<IconStrikethrough class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleCode().run()}
					active={isCode()}
					title="Inline Code"
				>
					<IconCode class="h-4 w-4" />
				</ToolbarButton>
			</div>

			<div class="w-px h-6 bg-border" />

			{/* Headings */}
			<div class="flex gap-1">
				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleHeading({ level: 1 }).run()}
					active={props.editor()?.isActive("heading", { level: 1 })}
					title="Heading 1"
				>
					<span class="font-semibold text-sm">H1</span>
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleHeading({ level: 2 }).run()}
					active={props.editor()?.isActive("heading", { level: 2 })}
					title="Heading 2"
				>
					<span class="font-semibold text-sm">H2</span>
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleHeading({ level: 3 }).run()}
					active={props.editor()?.isActive("heading", { level: 3 })}
					title="Heading 3"
				>
					<span class="font-semibold text-sm">H3</span>
				</ToolbarButton>
			</div>

			<div class="w-px h-6 bg-border" />

			{/* Lists */}
			<div class="flex gap-1">
				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleBulletList().run()}
					active={props.editor()?.isActive("bulletList")}
					title="Bullet List"
				>
					<IconList class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleOrderedList().run()}
					active={props.editor()?.isActive("orderedList")}
					title="Numbered List"
				>
					<IconListOrdered class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleBlockquote().run()}
					active={props.editor()?.isActive("blockquote")}
					title="Blockquote"
				>
					<IconQuote class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().toggleCodeBlock().run()}
					active={props.editor()?.isActive("codeBlock")}
					title="Code Block"
				>
					<IconSquareCode class="h-4 w-4" />
				</ToolbarButton>
			</div>

			<div class="w-px h-6 bg-border" />

			{/* Other actions */}
			<div class="flex gap-1">
				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().setHorizontalRule().run()}
					title="Horizontal Rule"
				>
					<IconMinus class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().setHardBreak().run()}
					title="Line Break"
				>
					<IconCornerDownLeft class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().undo().run()}
					disabled={!props.editor()?.can().undo()}
					title="Undo"
				>
					<IconUndo class="h-4 w-4" />
				</ToolbarButton>

				<ToolbarButton
					onClick={() => props.editor()?.chain().focus().redo().run()}
					disabled={!props.editor()?.can().redo()}
					title="Redo"
				>
					<IconRedo class="h-4 w-4" />
				</ToolbarButton>
			</div>
		</div>
	);
};

export const Editor: Component<EditorProps> = (props) => {
	const [local, _] = splitProps(props, [
		"content",
		"placeholder",
		"editable",
		"showToolbar",
		"class",
		"minHeight",
		"maxHeight",
		"onChange",
		"onReady",
		"onFocus",
		"onBlur",
		"extensions",
	]);

	let editorRef!: HTMLDivElement;

	// Build extensions array based on props
	const extensions = () => {
		const starterKitConfig: Record<string, unknown> = {};

		// Configure Link extension if enabled
		if (local.extensions?.link !== false) {
			starterKitConfig.link = {
				openOnClick: false,
				HTMLAttributes: {
					class: "text-primary underline",
				},
			};
		} else {
			starterKitConfig.link = false;
		}

		// Configure Underline extension if enabled
		if (local.extensions?.underline === false) {
			starterKitConfig.underline = false;
		}

		const exts: Extension[] = [StarterKit.configure(starterKitConfig) as unknown as Extension];

		if (local.placeholder) {
			exts.push(
				Placeholder.configure({
					placeholder: local.placeholder,
				})
			);
		}

		if (local.extensions?.typography !== false) {
			exts.push(Typography);
		}

		return exts;
	};

	const editor = createTiptapEditor(() => ({
		element: editorRef,
		extensions: extensions(),
		content: local.content || "<p></p>",
		editable: local.editable !== false,
		editorProps: {
			attributes: {
				class: cn(
					"prose prose-sm sm:prose lg:prose-lg",
					"max-w-none focus:outline-none",
					"min-h-[150px] p-4"
				),
			},
		},
		onCreate: ({ editor }) => {
			local.onReady?.(editor);
		},
		onUpdate: ({ editor }) => {
			const html = editor.getHTML();
			local.onChange?.(html);
		},
		onFocus: () => {
			local.onFocus?.();
		},
		onBlur: () => {
			local.onBlur?.();
		},
	}));

	// Cleanup on unmount
	onCleanup(() => {
		editor()?.destroy();
	});

	return (
		<div
			class={cn("border border-border rounded-lg bg-background overflow-hidden", local.class)}
			style={{
				"min-height": local.minHeight,
				"max-height": local.maxHeight,
			}}
		>
			<style>
				{`
          .prose :where(p):not(:where(.not-prose,.not-prose *)),
          .sm\\:prose :where(p):not(:where(.not-prose,.not-prose *)) {
            margin-top: 0.25em !important;
            margin-bottom: 0.25em !important;
          }
          .prose :where(ul,ol):not(:where(.not-prose,.not-prose *)),
          .sm\\:prose :where(ul,ol):not(:where(.not-prose,.not-prose *)) {
            margin-top: 0.5em !important;
            margin-bottom: 0.5em !important;
          }
          .prose :where(pre):not(:where(.not-prose,.not-prose *)),
          .sm\\:prose :where(pre):not(:where(.not-prose,.not-prose *)) {
            margin-top: 0.5em !important;
            margin-bottom: 0.5em !important;
          }
        `}
			</style>
			<Show when={local.showToolbar !== false && editor()}>
				<Toolbar editor={editor} />
			</Show>

			<div
				ref={editorRef}
				class="editor-content"
				style={{
					"min-height": local.minHeight || "150px",
					"max-height": local.maxHeight,
					overflow: "auto",
				}}
			/>
		</div>
	);
};

export const meta: ComponentMeta<EditorProps> = {
	name: "Editor",
	description:
		"A rich text editor built with TipTap, featuring a customizable toolbar with common formatting options.",
	apiReference: "",
	examples: [
		{
			title: "Basic Editor",
			description: "A simple editor with default settings",
			code: () => {
				const [content, setContent] = createSignal("");
				return (
					<div class="space-y-4">
						<Editor placeholder="Start typing..." onChange={setContent} minHeight="200px" />
						<div class="text-sm text-muted-foreground">Character count: {content().length}</div>
					</div>
				);
			},
		},
		{
			title: "With Initial Content",
			description: "Editor with pre-populated content",
			code: () => {
				const initialContent =
					"<h2>Welcome to the Editor</h2><p>This is some <strong>initial content</strong> with <em>formatting</em>.</p>";
				return <Editor content={initialContent} />;
			},
		},
		{
			title: "Read-only Mode",
			description: "Editor in non-editable mode for displaying content",
			code: () => {
				const content =
					"<h2>Documentation Overview</h2><p>This is a read-only editor displaying formatted content. Perfect for showing rich text without editing capabilities.</p><h3>Features</h3><ul><li>Text formatting support</li><li>Headings and lists</li><li>Code blocks and quotes</li><li>Links and emphasis</li></ul><blockquote>This content cannot be edited but maintains all the rich formatting options.</blockquote><p>Use this mode for displaying documentation, previews, or any content that should be <strong>read-only</strong>.</p>";
				return <Editor content={content} editable={false} showToolbar={false} minHeight="300px" />;
			},
		},
	],
};

export default Editor;

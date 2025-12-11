import { TreeView as ArkTreeView, createTreeCollection } from "@ark-ui/solid";
import type { JSX, Component } from "solid-js";
import { splitProps, For } from "solid-js";
import { cn } from "../lib/cn";
import { icon } from "../lib/icon";
import type { ComponentMeta } from "../lib/meta";

// Types
export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

type TreeViewProps = {
  collection?: ReturnType<typeof createTreeCollection<TreeNode>>;
  data?: TreeNode[];
  label?: string;
  expandedValue?: string[];
  defaultExpandedValue?: string[];
  selectedValue?: string[];
  defaultSelectedValue?: string[];
  onExpandedChange?: (details: { expandedValue: string[] }) => void;
  onSelectionChange?: (details: { selectedValue: string[] }) => void;
  selectionMode?: "single" | "multiple";
  scrollToIndexFn?: (details: { index: number }) => void;
  class?: string;
  renderBranch?: (node: TreeNode) => JSX.Element;
  renderItem?: (node: TreeNode) => JSX.Element;
};

// Internal recursive tree node renderer
const InternalTreeNode: Component<{
  node: TreeNode;
  indexPath: number[];
  renderBranch?: (node: TreeNode) => JSX.Element;
  renderItem?: (node: TreeNode) => JSX.Element;
}> = (props) => {
  return (
    <ArkTreeView.NodeProvider node={props.node} indexPath={props.indexPath}>
      {props.node.children ? (
        <ArkTreeView.Branch>
          <ArkTreeView.BranchControl
            class={cn(
              "flex items-center gap-1.5 py-1.5 px-1 rounded-md cursor-pointer select-none",
              "ps-[calc((var(--depth)-1)*22px)]",
              "[&[data-depth='1']]:ps-1",
              "hover:bg-accent hover:text-accent-foreground",
              "data-[selected]:text-primary",
              "data-[focus]:outline-none data-[focus]:ring-2 data-[focus]:ring-ring data-[focus]:ring-offset-1",
            )}
          >
            <ArkTreeView.BranchIndicator
              class={cn(
                "text-muted-foreground transition-transform duration-200 ease-default origin-center",
                "data-[state=open]:rotate-90",
              )}
            >
              <div class={cn("h-4 w-4", icon("chevron-right"))} />
            </ArkTreeView.BranchIndicator>
            <ArkTreeView.BranchText class="flex items-center gap-2">
              {props.renderBranch ? (
                props.renderBranch(props.node)
              ) : (
                <>
                  <div class={cn("h-4 w-4", icon("folder"))} />
                  {props.node.name}
                </>
              )}
            </ArkTreeView.BranchText>
          </ArkTreeView.BranchControl>
          <ArkTreeView.BranchContent class="relative overflow-hidden transition-all duration-200 ease-out data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out">
            <style>
              {`
                @keyframes slideDown {
                  from {
                    height: 0;
                    opacity: 0;
                  }
                  to {
                    height: var(--height);
                    opacity: 1;
                  }
                }

                @keyframes slideUp {
                  from {
                    height: var(--height);
                    opacity: 1;
                  }
                  to {
                    height: 0;
                    opacity: 0;
                  }
                }

                [data-scope="tree-view"][data-part="branch-content"][data-state="open"] {
                  animation: slideDown 200ms cubic-bezier(0.16, 1, 0.3, 1);
                }

                [data-scope="tree-view"][data-part="branch-content"][data-state="closed"] {
                  animation: slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1);
                }
              `}
            </style>
            <ArkTreeView.BranchIndentGuide
              class={cn(
                "h-full w-px bg-border absolute",
                "left-[calc((var(--depth)-1)*29px)]",
                "[&[data-depth='1']]:left-3",
              )}
            />
            <For each={props.node.children}>
              {(child, index) => (
                <InternalTreeNode
                  node={child}
                  indexPath={[...props.indexPath, index()]}
                  renderBranch={props.renderBranch}
                  renderItem={props.renderItem}
                />
              )}
            </For>
          </ArkTreeView.BranchContent>
        </ArkTreeView.Branch>
      ) : (
        <ArkTreeView.Item
          class={cn(
            "flex items-center gap-2 rounded-md cursor-pointer relative py-1.5 px-1",
            "ps-[calc(var(--depth)*22px)]",
            "hover:bg-accent hover:text-accent-foreground",
            "data-[selected]:text-primary",
            "data-[focus]:outline-none data-[focus]:ring-2 data-[focus]:ring-ring data-[focus]:ring-offset-1",
          )}
        >
          <ArkTreeView.ItemText class="flex items-center gap-2">
            {props.renderItem ? (
              props.renderItem(props.node)
            ) : (
              <>
                <div class={cn("h-4 w-4", icon("file"))} />
                {props.node.name}
              </>
            )}
          </ArkTreeView.ItemText>
        </ArkTreeView.Item>
      )}
    </ArkTreeView.NodeProvider>
  );
};

export const TreeView: Component<TreeViewProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "label",
    "collection",
    "data",
    "renderBranch",
    "renderItem",
  ]);

  // Create collection from data if provided, otherwise use collection prop
  const treeCollection = () => {
    if (local.collection) {
      return local.collection;
    }
    if (local.data) {
      return createTreeCollection<TreeNode>({
        nodeToValue: (node) => node.id,
        nodeToString: (node) => node.name,
        rootNode: {
          id: "ROOT",
          name: "",
          children: local.data,
        },
      });
    }
    // Fallback empty collection
    return createTreeCollection<TreeNode>({
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
      rootNode: { id: "ROOT", name: "", children: [] },
    });
  };

  return (
    <ArkTreeView.Root
      class={cn("w-full", local.class)}
      collection={treeCollection()}
      {...others}
    >
      {local.label && (
        <ArkTreeView.Label class="text-sm font-semibold mb-2">
          {local.label}
        </ArkTreeView.Label>
      )}
      <ArkTreeView.Tree class="flex flex-col text-sm [&_svg]:w-4 [&_svg]:h-4">
        <For each={treeCollection().rootNode.children}>
          {(node, index) => (
            <InternalTreeNode
              node={node}
              indexPath={[index()]}
              renderBranch={local.renderBranch}
              renderItem={local.renderItem}
            />
          )}
        </For>
      </ArkTreeView.Tree>
    </ArkTreeView.Root>
  );
};

// Export composable components for advanced usage
export const TreeViewRoot = ArkTreeView.Root;
export const TreeViewLabel = ArkTreeView.Label;
export const TreeViewTree = ArkTreeView.Tree;
export const TreeViewNodeProvider = ArkTreeView.NodeProvider;
export const TreeViewBranch = ArkTreeView.Branch;
export const TreeViewBranchControl = ArkTreeView.BranchControl;
export const TreeViewBranchText = ArkTreeView.BranchText;
export const TreeViewBranchIndicator = ArkTreeView.BranchIndicator;
export const TreeViewBranchContent = ArkTreeView.BranchContent;
export const TreeViewBranchIndentGuide = ArkTreeView.BranchIndentGuide;
export const TreeViewItem = ArkTreeView.Item;
export const TreeViewItemText = ArkTreeView.ItemText;
export const TreeViewItemIndicator = ArkTreeView.ItemIndicator;

export const meta: ComponentMeta<TreeViewProps> = {
  name: "TreeView",
  description:
    "A tree view component that displays hierarchical data in an expandable structure. Perfect for file explorers, navigation menus, and nested lists.",
  examples: [
    {
      title: "Basic",
      description: "A simple tree view with folders and files",
      code: () => {
        return (
          <TreeView
            label="Project Files"
            data={[
              {
                id: "node_modules",
                name: "node_modules",
                children: [
                  { id: "node_modules/zag-js", name: "zag-js" },
                  {
                    id: "node_modules/@types",
                    name: "@types",
                    children: [
                      { id: "node_modules/@types/react", name: "react" },
                      {
                        id: "node_modules/@types/react-dom",
                        name: "react-dom",
                      },
                    ],
                  },
                ],
              },
              {
                id: "src",
                name: "src",
                children: [
                  { id: "src/app.tsx", name: "app.tsx" },
                  { id: "src/index.ts", name: "index.ts" },
                ],
              },
              { id: "package.json", name: "package.json" },
              { id: "readme.md", name: "README.md" },
            ]}
          />
        );
      },
    },
    {
      title: "With Selection",
      description: "Tree view with single selection enabled",
      code: () => {
        return (
          <TreeView
            label="Documentation"
            selectionMode="single"
            defaultSelectedValue={["docs/getting-started"]}
            data={[
              {
                id: "docs",
                name: "Documentation",
                children: [
                  { id: "docs/getting-started", name: "Getting Started" },
                  { id: "docs/installation", name: "Installation" },
                ],
              },
              {
                id: "examples",
                name: "Examples",
                children: [
                  { id: "examples/react", name: "React Examples" },
                  { id: "examples/vue", name: "Vue Examples" },
                ],
              },
            ]}
          />
        );
      },
    },
    {
      title: "Custom Rendering",
      description: "Customize how branches and items are rendered",
      code: () => {
        return (
          <TreeView
            label="Source Code"
            defaultExpandedValue={["components"]}
            data={[
              {
                id: "components",
                name: "components",
                children: [
                  { id: "components/button.tsx", name: "button.tsx" },
                  { id: "components/input.tsx", name: "input.tsx" },
                ],
              },
              {
                id: "lib",
                name: "lib",
                children: [
                  { id: "lib/utils.ts", name: "utils.ts" },
                  { id: "lib/cn.ts", name: "cn.ts" },
                ],
              },
            ]}
            renderBranch={(node) => (
              <>
                <div class="h-4 w-4 i-lucide-folder-open" />
                <span class="font-semibold">{node.name}</span>
              </>
            )}
            renderItem={(node) => (
              <>
                <div class="h-4 w-4 i-lucide-file-code" />
                <span class="text-muted-foreground">{node.name}</span>
              </>
            )}
          />
        );
      },
    },
  ],
};

export default TreeView;
export { createTreeCollection };

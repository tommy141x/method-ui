import type { JSX, Component } from "solid-js";
import { splitProps } from "solid-js";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { ComponentMeta } from "../lib/meta";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
      clickable: {
        true: "cursor-pointer",
        false: "cursor-default",
      },
    },
    defaultVariants: {
      variant: "default",
      clickable: false,
    },
  },
);

export interface BadgeProps {
  children?: JSX.Element;
  variant?: VariantProps<typeof badgeVariants>["variant"];
  clickable?: boolean;
  onClick?: (event: MouseEvent) => void;
  class?: string;
}

export const Badge: Component<BadgeProps> = (props) => {
  const [local, variantProps, others] = splitProps(
    props,
    ["children", "class", "onClick"],
    ["variant", "clickable"],
  );

  return (
    <div
      class={cn(
        badgeVariants({
          variant: variantProps.variant,
          clickable: variantProps.clickable,
        }),
        local.class,
      )}
      onClick={local.onClick}
      {...others}
    >
      {local.children}
    </div>
  );
};

export const meta: ComponentMeta<BadgeProps> = {
  name: "Badge",
  description:
    "A badge component for displaying small pieces of information like labels, status, or counts.",
  apiReference: "",
  variants: badgeVariants,
  examples: [
    {
      title: "Basic",
      description: "Badge variants",
      code: () => (
        <div class="flex flex-wrap gap-2">
          <Badge>Badge</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      ),
    },
    {
      title: "With Icon",
      description: "Badge with an icon",
      code: () => (
        <div class="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            class="bg-blue-500 text-white dark:bg-blue-600"
          >
            <div class="h-3 w-3 i-lucide-badge-check" />
            Verified
          </Badge>
          <Badge>
            <div class="h-3 w-3 i-lucide-star" />
            Featured
          </Badge>
          <Badge variant="destructive">
            <div class="h-3 w-3 i-lucide-alert-circle" />
            Error
          </Badge>
        </div>
      ),
    },
    {
      title: "Notification Badges",
      description: "Circular badges for counts",
      code: () => (
        <div class="flex flex-wrap gap-2">
          <Badge class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums">
            8
          </Badge>
          <Badge
            class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
            variant="destructive"
          >
            99
          </Badge>
          <Badge
            class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
            variant="outline"
          >
            20+
          </Badge>
          <Badge
            class="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums"
            variant="secondary"
          >
            3
          </Badge>
        </div>
      ),
    },
    {
      title: "Custom Colors",
      description: "Badges with custom background colors",
      code: () => (
        <div class="flex flex-wrap gap-2">
          <Badge class="bg-green-500 text-white hover:bg-green-600">
            Success
          </Badge>
          <Badge class="bg-yellow-500 text-white hover:bg-yellow-600">
            Warning
          </Badge>
          <Badge class="bg-purple-500 text-white hover:bg-purple-600">
            Info
          </Badge>
          <Badge class="bg-orange-500 text-white hover:bg-orange-600">
            Pending
          </Badge>
        </div>
      ),
    },
    {
      title: "Sizes",
      description: "Different badge sizes",
      code: () => (
        <div class="flex flex-wrap items-center gap-2">
          <Badge class="text-[10px] px-1.5 py-0">Small</Badge>
          <Badge>Default</Badge>
          <Badge class="text-sm px-3 py-1">Large</Badge>
        </div>
      ),
    },
    {
      title: "Clickable",
      description: "Interactive badges with click handlers",
      code: () => (
        <div class="flex flex-wrap gap-2">
          <Badge clickable onClick={() => alert("Badge clicked!")}>
            Click me
          </Badge>
          <Badge
            variant="secondary"
            clickable
            onClick={() => console.log("Secondary clicked")}
          >
            <div class="h-3 w-3 i-lucide-mouse-pointer-click" />
            Interactive
          </Badge>
          <Badge
            variant="outline"
            clickable
            onClick={() => alert("Outline clicked")}
          >
            Clickable
          </Badge>
          <Badge>Not clickable</Badge>
        </div>
      ),
    },
  ],
};

export default Badge;

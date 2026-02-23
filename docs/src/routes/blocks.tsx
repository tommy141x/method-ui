import { createFileRoute, Link } from "@tanstack/solid-router";
import IconArrowRight from "~icons/lucide/arrow-right";
import IconBox from "~icons/lucide/box";
import IconCreditCard from "~icons/lucide/credit-card";
import IconLayers from "~icons/lucide/layers";
import IconLayoutDashboard from "~icons/lucide/layout-dashboard";
import IconMegaphone from "~icons/lucide/megaphone";
import IconShoppingCart from "~icons/lucide/shopping-cart";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Navbar } from "../components/navbar";
import { Separator } from "../components/separator";

export const Route = createFileRoute("/blocks")({
	component: Blocks,
});

const categories = [
	{
		icon: IconMegaphone,
		name: "Marketing",
		description:
			"Hero sections, feature grids, testimonials, pricing tables, and CTAs.",
		count: 0,
	},
	{
		icon: IconLayoutDashboard,
		name: "Application UI",
		description:
			"Dashboards, data tables, stats cards, and full application shells.",
		count: 0,
	},
	{
		icon: IconShoppingCart,
		name: "E-commerce",
		description:
			"Product listings, cart drawers, checkout flows, and order history.",
		count: 0,
	},
	{
		icon: IconLayers,
		name: "Forms",
		description:
			"Multi-step forms, authentication screens, and settings panels.",
		count: 0,
	},
	{
		icon: IconCreditCard,
		name: "Billing",
		description:
			"Subscription plans, invoices, payment methods, and usage meters.",
		count: 0,
	},
	{
		icon: IconBox,
		name: "Miscellaneous",
		description: "Empty states, error pages, loaders, and utility layouts.",
		count: 0,
	},
];

function Blocks() {
	return (
		<div class="min-h-screen bg-background text-foreground">
			<Navbar />

			<div class="container mx-auto px-4 py-16 max-w-5xl">
				{/* Header */}
				<div class="mb-12">
					<Badge variant="secondary" class="mb-4 text-xs">
						Coming Soon
					</Badge>
					<h1 class="text-3xl md:text-4xl font-bold tracking-tight mb-3">
						Blocks
					</h1>
					<p class="text-muted-foreground text-base max-w-xl leading-relaxed">
						Pre-built, production-ready sections you can drop straight into your
						app. Every block is composed from Method UI components — copy the
						code, customise freely.
					</p>
				</div>

				<Separator class="mb-12" />

				{/* Category grid */}
				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
					{categories.map((cat) => (
						<div class="group relative rounded-lg border border-border bg-card p-5 flex flex-col gap-4 opacity-70">
							{/* Coming soon overlay badge */}
							<div class="absolute top-3 right-3">
								<Badge variant="outline" class="text-[10px] px-1.5 py-0 h-4">
									Soon
								</Badge>
							</div>

							<div class="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted">
								<cat.icon class="h-4.5 w-4.5 text-muted-foreground" />
							</div>

							<div class="flex-1">
								<h3 class="font-semibold text-sm mb-1">{cat.name}</h3>
								<p class="text-xs text-muted-foreground leading-relaxed">
									{cat.description}
								</p>
							</div>

							<div class="text-xs text-muted-foreground">
								{cat.count === 0 ? "No blocks yet" : `${cat.count} blocks`}
							</div>
						</div>
					))}
				</div>

				<Separator class="mb-12" />

				{/* What are blocks */}
				<div class="grid md:grid-cols-2 gap-8 mb-12">
					<div>
						<h2 class="text-xl font-semibold mb-3">What are blocks?</h2>
						<p class="text-sm text-muted-foreground leading-relaxed mb-4">
							Blocks are full page sections — hero banners, feature grids,
							pricing tables, dashboards — built entirely from Method UI
							primitives. Like components, you copy the source into your project
							and own it completely.
						</p>
						<p class="text-sm text-muted-foreground leading-relaxed">
							Each block is responsive, accessible, dark-mode compatible, and
							ships with TypeScript types. No external images, no hard-coded
							content — just clean, editable code.
						</p>
					</div>

					<div class="space-y-3">
						{[
							{
								title: "Copy and paste ready",
								description:
									"Paste a block into any route and it works immediately.",
							},
							{
								title: "Built from components",
								description:
									"Every element uses the same Method UI components you already have.",
							},
							{
								title: "Fully responsive",
								description: "Tested at every breakpoint, mobile to desktop.",
							},
							{
								title: "Theme aware",
								description:
									"Inherits your CSS variables and switches themes automatically.",
							},
						].map((item) => (
							<div class="flex gap-3 rounded-lg border border-border bg-card p-3.5">
								<div class="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
								<div>
									<p class="text-sm font-medium">{item.title}</p>
									<p class="text-xs text-muted-foreground mt-0.5">
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<Separator class="mb-12" />

				{/* CTA */}
				<div class="text-center space-y-4">
					<p class="text-sm text-muted-foreground">
						Blocks are in development. In the meantime, browse the component
						library and start composing your own.
					</p>
					<div class="flex flex-wrap items-center justify-center gap-3">
						<Link to="/components/$component" params={{ component: "button" }}>
							<Button class="gap-2">
								Browse components
								<IconArrowRight class="h-4 w-4" />
							</Button>
						</Link>
						<Link to="/docs/getting-started">
							<Button variant="outline" class="gap-2">
								Getting started
								<IconArrowRight class="h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer class="border-t border-border py-8 mt-8">
				<div class="container mx-auto px-4 text-center text-xs text-muted-foreground">
					Built with SolidJS, Ark UI &amp; UnoCSS
				</div>
			</footer>
		</div>
	);
}

import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Navbar } from "../components/navbar";

export default function Blocks() {
	const blockCategories = [
		{
			name: "Marketing",
			description: "Landing pages, hero sections, and marketing components",
			count: 0,
		},
		{
			name: "Application UI",
			description: "Dashboards, tables, and application interfaces",
			count: 0,
		},
		{
			name: "E-commerce",
			description: "Product listings, checkout flows, and store components",
			count: 0,
		},
		{
			name: "Forms",
			description: "Multi-step forms, authentication, and user input",
			count: 0,
		},
	];

	return (
		<div class="min-h-screen bg-background">
			<Navbar />

			<div class="container mx-auto px-4 py-12">
				{/* Header */}
				<div class="max-w-3xl mb-12">
					<Badge variant="secondary" class="mb-4">
						Coming Soon
					</Badge>
					<h1 class="text-4xl md:text-5xl font-bold mb-4">Component Blocks</h1>
					<p class="text-xl text-muted-foreground">
						Pre-built sections and layouts you can copy and paste into your apps. Built with Method
						UI components.
					</p>
				</div>

				{/* Categories Grid */}
				<div class="grid md:grid-cols-2 gap-6 mb-12">
					{blockCategories.map((category) => (
						<Card>
							<CardHeader>
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<CardTitle>{category.name}</CardTitle>
										<CardDescription class="mt-2">{category.description}</CardDescription>
									</div>
									<Badge variant="secondary" class="ml-4">
										{category.count}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<Button variant="outline" disabled class="w-full">
									Coming Soon
								</Button>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Info Card */}
				<Card class="max-w-3xl">
					<CardHeader>
						<CardTitle>What are blocks?</CardTitle>
						<CardDescription class="mt-2">
							Blocks are fully responsive, production-ready sections that you can copy and paste
							into your application. They're built using Method UI components and follow best
							practices for accessibility and design.
						</CardDescription>
					</CardHeader>
					<CardContent class="space-y-4">
						<div>
							<h3 class="font-semibold mb-2">✨ Features</h3>
							<ul class="space-y-2 text-sm text-muted-foreground">
								<li>• Copy and paste ready - no installation required</li>
								<li>• Fully responsive and mobile-friendly</li>
								<li>• Dark mode compatible</li>
								<li>• Built with TypeScript</li>
								<li>• Customizable and themeable</li>
							</ul>
						</div>
						<div>
							<h3 class="font-semibold mb-2">📦 Coming Soon</h3>
							<p class="text-sm text-muted-foreground">
								We're working hard on creating a comprehensive collection of blocks for various use
								cases. Check back soon!
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Footer */}
			<footer class="container mx-auto px-4 py-12 border-t border-border mt-12">
				<div class="max-w-6xl mx-auto text-center text-muted-foreground">
					<p>Built with ❤️ using SolidJS and Ark UI</p>
				</div>
			</footer>
		</div>
	);
}

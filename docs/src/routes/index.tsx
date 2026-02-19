import { A } from "@solidjs/router";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/card";
import { Navbar } from "../components/navbar";

export default function Home() {
	return (
		<div class="min-h-screen bg-background">
			<Navbar />

			{/* Hero Section */}
			<section class="container mx-auto px-4 py-20 md:py-32">
				<div class="max-w-4xl mx-auto text-center space-y-6">
					<Badge variant="secondary" class="mb-4">
						Built with SolidJS & Ark UI
					</Badge>
					<h1 class="text-5xl md:text-7xl font-bold tracking-tight">
						Build beautiful apps with <span class="text-primary">Method UI</span>
					</h1>
					<p class="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
						A comprehensive component library for SolidJS. Beautifully designed, accessible, and
						customizable components for your next project.
					</p>
					<div class="flex flex-wrap items-center justify-center gap-4 pt-6">
						<A href="/docs">
							<Button size="lg" class="text-lg px-8">
								Get Started
							</Button>
						</A>
						<A href="/components/button">
							<Button size="lg" variant="outline" class="text-lg px-8">
								View Components
							</Button>
						</A>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section class="container mx-auto px-4 py-20 border-t border-border">
				<div class="max-w-6xl mx-auto">
					<div class="text-center mb-16">
						<h2 class="text-3xl md:text-4xl font-bold mb-4">Why Method UI?</h2>
						<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
							Everything you need to build modern web applications
						</p>
					</div>

					<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>🎨 Customizable</CardTitle>
								<CardDescription>
									Fully themeable components with CSS variables and variants. Make it yours with
									minimal effort.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>♿ Accessible</CardTitle>
								<CardDescription>
									Built on top of Ark UI with WAI-ARIA compliance. Keyboard navigation and screen
									reader support out of the box.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>⚡ Fast</CardTitle>
								<CardDescription>
									Powered by SolidJS for blazing fast performance. Fine-grained reactivity with no
									virtual DOM overhead.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>📦 Ready to Use</CardTitle>
								<CardDescription>
									Copy and paste components directly into your project. No package installation
									required.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>🎯 TypeScript</CardTitle>
								<CardDescription>
									Fully typed components with excellent IDE support. Catch errors early with type
									safety.
								</CardDescription>
							</CardHeader>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>🌙 Dark Mode</CardTitle>
								<CardDescription>
									Built-in dark mode support with automatic theme switching. Beautiful in both light
									and dark themes.
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</section>

			{/* Quick Start Section */}
			<section class="container mx-auto px-4 py-20 border-t border-border">
				<div class="max-w-4xl mx-auto">
					<div class="text-center mb-12">
						<h2 class="text-3xl md:text-4xl font-bold mb-4">Quick Start</h2>
						<p class="text-lg text-muted-foreground">Get up and running in minutes</p>
					</div>

					<Card>
						<CardHeader>
							<CardTitle>Installation</CardTitle>
							<CardDescription>Add Method UI to your SolidJS project</CardDescription>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="bg-muted rounded-lg p-4 font-mono text-sm">
								npm install @ark-ui/solid solid-js
							</div>
							<p class="text-sm text-muted-foreground">
								Then browse the components in the docs and copy the code you need into your project.
							</p>
							<A href="/docs">
								<Button>Browse Components</Button>
							</A>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer class="container mx-auto px-4 py-12 border-t border-border">
				<div class="max-w-6xl mx-auto text-center text-muted-foreground">
					<p>Built with ❤️ using SolidJS and Ark UI</p>
				</div>
			</footer>
		</div>
	);
}

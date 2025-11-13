import { Title, Meta } from "@solidjs/meta";
import { Navbar } from "../../components/navbar";
import { DocsSidebar } from "../../components/docs-sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/card";
import { A } from "@solidjs/router";
import { Button } from "../../components/button";

export default function GettingStarted() {
  return (
    <div class="min-h-screen bg-background">
      <Title>Getting Started - Method UI Documentation</Title>
      <Meta
        name="description"
        content="Learn how to use Method UI components in your SolidJS project. Examples, customization, TypeScript support, and more."
      />

      <Navbar />

      <div class="container mx-auto px-4 py-6">
        <div class="flex gap-6">
          <DocsSidebar />

          {/* Main Content */}
          <main class="flex-1 min-w-0">
            <div class="space-y-6">
              <div>
                <h1 class="text-4xl font-bold mb-4">Getting Started</h1>
                <p class="text-lg text-muted-foreground mb-6">
                  Learn how to use Method UI in your project
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Start</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    After installing the dependencies, you're ready to start using
                    Method UI components in your SolidJS application.
                  </p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Add your first component
bunx method@latest add button

// Use it in your app
import { Button } from "./components/button";

export default function App() {
  return <Button>Click me</Button>;
}`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Using Components</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    Components are designed to be flexible and customizable. Here's a
                    complete example:
                  </p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`import { Button } from "./components/button";
import { Card, CardHeader, CardTitle, CardContent } from "./components/card";

export default function MyComponent() {
  const handleClick = () => {
    console.log("Button clicked!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a simple example using Method UI components.</p>
        <Button onClick={handleClick} variant="default">
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Component Variants</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    Most components come with multiple variants to match your design needs.
                    Check each component's documentation for available options.
                  </p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// Button variants
<Button variant="default">Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Styling & Customization</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    Method UI uses CSS variables for theming, making it easy to customize
                    colors and styles across your entire application.
                  </p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`/* In your global.css */
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --accent: 210 40% 96.1%;
  /* ... more variables */
}

.dark {
  --primary: 210 40% 98%;
  --secondary: 217.2 32.6% 17.5%;
  /* ... dark mode overrides */
}`}</pre>
                  </div>
                  <div class="mt-4">
                    <A href="/themes">
                      <Button variant="outline">Explore Themes</Button>
                    </A>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>TypeScript Support</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    All Method UI components are written in TypeScript and provide full
                    type definitions. Your IDE will give you autocomplete and type
                    checking out of the box.
                  </p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`import { Button } from "./components/button";
import type { ButtonProps } from "./components/button";

// TypeScript knows all the available props
const MyButton = (props: ButtonProps) => {
  return <Button {...props} />;
};`}</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accessibility</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    Method UI components are built with accessibility in mind using Ark UI:
                  </p>
                  <ul class="space-y-2 list-disc list-inside ml-4">
                    <li>WAI-ARIA compliant components</li>
                    <li>Keyboard navigation support</li>
                    <li>Screen reader friendly</li>
                    <li>Focus management</li>
                    <li>Proper semantic HTML</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>Now that you're set up, explore more:</p>
                  <div class="flex flex-wrap gap-3">
                    <A href="/components">
                      <Button>Browse Components</Button>
                    </A>
                    <A href="/blocks">
                      <Button variant="outline">View Blocks</Button>
                    </A>
                    <A href="/themes">
                      <Button variant="outline">Customize Themes</Button>
                    </A>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer class="border-t border-border mt-12">
        <div class="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>
            Built with <span class="text-red-500">♥</span> using SolidJS, Ark
            UI, and UnoCSS
          </p>
        </div>
      </footer>
    </div>
  );
}

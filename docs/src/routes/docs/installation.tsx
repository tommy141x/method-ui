import { Title, Meta } from "@solidjs/meta";
import { Navbar } from "../../components/navbar";
import { DocsSidebar } from "../../components/docs-sidebar";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/card";

export default function Installation() {
  return (
    <div class="min-h-screen bg-background">
      <Title>Installation - Method UI Documentation</Title>
      <Meta
        name="description"
        content="Learn how to install and set up Method UI in your SolidJS project. Get started with components, dependencies, and utilities."
      />

      <Navbar />

      <div class="container mx-auto px-4 py-6">
        <div class="flex gap-6">
          <DocsSidebar />

          {/* Main Content */}
          <main class="flex-1 min-w-0">
            <div class="space-y-6">
              <div>
                <h1 class="text-4xl font-bold mb-4">Installation</h1>
                <p class="text-lg text-muted-foreground mb-6">
                  Get started with Method UI in your SolidJS project
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    Make sure you have a SolidJS project set up. If not, you can
                    create one with:
                  </p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>npm create solid@latest</pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Install Dependencies</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>Install the required peer dependencies:</p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>npm install @ark-ui/solid solid-js</pre>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Or using your preferred package manager:
                  </p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto space-y-2">
                    <div># pnpm</div>
                    <div>pnpm add @ark-ui/solid solid-js</div>
                    <div class="mt-2"># yarn</div>
                    <div>yarn add @ark-ui/solid solid-js</div>
                    <div class="mt-2"># bun</div>
                    <div>bun add @ark-ui/solid solid-js</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Components</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>Use the CLI to add components to your project:</p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>bunx method@latest add button</pre>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    This will copy the component files directly into your project.
                    You can then customize them however you like!
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manual Installation</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    Alternatively, browse the components in the documentation and
                    copy the code directly into your project:
                  </p>
                  <ol class="space-y-2 list-decimal list-inside ml-4">
                    <li>Browse the components in the sidebar</li>
                    <li>Click on a component to view its code</li>
                    <li>Copy the component code</li>
                    <li>Paste it into your project's components directory</li>
                    <li>
                      Install any dependencies listed in the component
                      documentation
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Setup Utilities</CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <p>
                    Method UI components use a few utility functions. Make sure
                    these are set up in your project:
                  </p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`// lib/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`}</pre>
                  </div>
                  <p class="text-sm text-muted-foreground mt-4">
                    Install the required utility packages:
                  </p>
                  <div class="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <pre>npm install clsx tailwind-merge</pre>
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

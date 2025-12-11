import { Title, Meta } from "@solidjs/meta";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/card";
import { DocsLayout } from "../../components/docs-layout";

export default function Installation() {
  return (
    <DocsLayout>
      <Title>Installation - Method UI Documentation</Title>
      <Meta
        name="description"
        content="Learn how to install and set up Method UI in your SolidJS project."
      />

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
            <p>Before installing Method UI, make sure you have:</p>
            <ul class="space-y-2 list-disc list-inside ml-4">
              <li>Node.js 18.x or later</li>
              <li>A SolidJS project set up</li>
              <li>Basic knowledge of SolidJS and TypeScript</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Installation Steps</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <h3 class="font-semibold mb-2">1. Install Dependencies</h3>
              <p class="text-sm text-muted-foreground mb-2">
                Install the required peer dependencies:
              </p>
              <pre class="bg-muted p-4 rounded-md overflow-x-auto">
                <code>npm install @ark-ui/solid clsx</code>
              </pre>
            </div>

            <div>
              <h3 class="font-semibold mb-2">2. Set Up Styling</h3>
              <p class="text-sm text-muted-foreground mb-2">
                Method UI uses CSS variables for theming. Add the base styles to
                your global CSS file:
              </p>
              <pre class="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                <code>{`@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ... more variables */
  }
}`}</code>
              </pre>
            </div>

            <div>
              <h3 class="font-semibold mb-2">3. Copy Components</h3>
              <p class="text-sm text-muted-foreground mb-2">
                Browse the component library and copy the components you need
                into your project. Each component is self-contained and can be
                customized to your needs.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Structure</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="mb-4">We recommend the following structure:</p>
            <pre class="bg-muted p-4 rounded-md overflow-x-auto text-sm">
              <code>{`src/
  components/
    ui/
      button.tsx
      card.tsx
      ...
  lib/
    utils.ts
  app.tsx`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </DocsLayout>
  );
}

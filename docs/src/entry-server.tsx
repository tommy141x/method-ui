// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link rel="icon" href="/favicon.ico" />
					<script
						innerHTML={`
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var validThemes = ['base','light','rose','orange','retro','retro-light'];
                if (!theme || validThemes.indexOf(theme) === -1) {
                  theme = 'base';
                }
                // Don't add 'base' as a class - it uses :root
                if (theme !== 'base') {
                  document.documentElement.classList.add(theme);
                }
              } catch (e) {}
            })();
          `}
					/>
					{assets}
				</head>
				<body>
					<div id="app">{children}</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));

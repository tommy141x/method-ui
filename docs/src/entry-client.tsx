// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import "virtual:uno.css";

const container = document.getElementById("app");
if (!container) throw new Error("Root element #app not found");
mount(() => <StartClient />, container);

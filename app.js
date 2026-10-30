// app.js – startup file for cPanel / DirectAdmin "Setup Node.js App" (Phusion Passenger).

import { register } from "tsx/esm/api";

// Safety net: if NODE_ENV was forgotten in the hosting panel, run in production mode
process.env.NODE_ENV ??= "production";

register(); // enable importing .ts files

import("./server/index.ts").catch((err) => {
  console.error("Geaworth failed to start:", err);
  process.exit(1);
});


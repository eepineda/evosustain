import type { NextConfig } from "next";

// No `output: "standalone"`: Railway/Nixpacks keeps full node_modules and runs
// `npm run start`, which is incompatible with the standalone output mode.
const nextConfig: NextConfig = {};

export default nextConfig;

import {loadEnvConfig} from "@next/env";
import type {NextConfig} from "next";

import {getPublicEnv} from "./src/lib/env/public-env";

loadEnvConfig(process.cwd());
getPublicEnv();

const nextConfig: NextConfig = {};

export default nextConfig;

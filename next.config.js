// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };

      // Add Monaco webpack plugin if needed in the future
      // We're using @monaco-editor/react which handles this for us
    }

    return config;
  },
};

module.exports = nextConfig;

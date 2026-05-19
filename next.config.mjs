/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./prisma/catalog.db"]
  }
};

export default nextConfig;

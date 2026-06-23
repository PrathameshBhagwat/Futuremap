/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  typescript: {
    // We have fixed the TS errors, enforce strict builds in production
    ignoreBuildErrors: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Update this to specific domains (e.g., supabase.co) in a strict production environment
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ]
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle node modules that should not be bundled for the server
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas']
    }
    
    // Add fallback for canvas which is not needed in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'canvas': false,
    }
    
    // Replace troika-worker-utils with mock for both server and client
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^troika-worker-utils$/,
        require.resolve('./lib/empty-module.mjs')
      )
    )
    
    // Additional alias to ensure consistent module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      'troika-worker-utils$': require.resolve('./lib/empty-module.mjs'),
    }

    // Add custom plugin to handle troika-three-text font data issues
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.TROIKA_FONT_FALLBACK': JSON.stringify(true)
      })
    )
    
    // Handle potential node-specific modules for troika-three-text
    if (isServer) {
      config.externals.push('sharp')
    }
    
    return config
  },
}

module.exports = nextConfig
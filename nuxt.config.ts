export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: ["vuetify/styles", "@mdi/font/css/materialdesignicons.min.css"],
    build: {
        transpile: ["vuetify"],
    },
    modules: ['@pinia/nuxt'],
    alias: {
        '@': '/<rootDir>',
        '~': '/<rootDir>',
    },
    imports: {
        dirs: [
            'stores',
            'composables',
            'types'
        ]
    },
    runtimeConfig: {
       
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        jwtExpiration: process.env.JWT_EXPIRATION || '24h',
        redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
        // Comma-separated list of origins or '*' for any
        corsAllowedOrigins: process.env.CORS_ORIGINS || 'http://136.114.154.96:3000',
        
        public: {
            apiBase: ''
        }
    },
    ssr: false,
    nitro: {
        experimental: {
            openAPI: true
        }
    }
});

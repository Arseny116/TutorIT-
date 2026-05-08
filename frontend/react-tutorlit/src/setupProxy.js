const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    // API аутентификации и пользователей (порт 8081)
    app.use(
        '/api/v1/Authentication',
        createProxyMiddleware({
            target: 'http://89.110.94.112:8081',
            changeOrigin: true,
            timeout: 60000,
            proxyTimeout: 60000,
        })
    );

    app.use(
        '/api/user',
        createProxyMiddleware({
            target: 'http://89.110.94.112:8081',
            changeOrigin: true,
            timeout: 60000,
            proxyTimeout: 60000,
        })
    );

    // API курсов (порт 8080)
    app.use(
        '/api/v1/Courses',
        createProxyMiddleware({
            target: 'http://89.110.94.112:8080',
            changeOrigin: true,
            timeout: 60000,
            proxyTimeout: 60000,
        })
    );

    app.use(
        '/api/v1/Chapters',
        createProxyMiddleware({
            target: 'http://89.110.94.112:8080',
            changeOrigin: true,
            timeout: 60000,
            proxyTimeout: 60000,
        })
    );

    app.use(
        '/api/v1/Theories',
        createProxyMiddleware({
            target: 'http://89.110.94.112:8080',
            changeOrigin: true,
            timeout: 60000,
            proxyTimeout: 60000,
        })
    );

    app.use(
        '/api/v1/TasksCreators',
        createProxyMiddleware({
            target: 'http://89.110.94.112:8080',
            changeOrigin: true,
            timeout: 60000,
            proxyTimeout: 60000,
        })
    );

    app.use(
        '/api/v1/Questions',
        createProxyMiddleware({
            target: 'http://89.110.94.112:8080',
            changeOrigin: true,
            timeout: 60000,
            proxyTimeout: 60000,
        })
    );
};
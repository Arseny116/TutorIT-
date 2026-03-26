const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    // API курсов (порт 8080)
    app.use(
        '/api/v1/Courses',
        createProxyMiddleware({
            target: 'http://94.103.85.168:8080',
            changeOrigin: true,
        })
    );

    app.use(
        '/api/v1/Chapters',
        createProxyMiddleware({
            target: 'http://94.103.85.168:8080',
            changeOrigin: true,
        })
    );

    app.use(
        '/api/v1/Theories',
        createProxyMiddleware({
            target: 'http://94.103.85.168:8080',
            changeOrigin: true,
        })
    );

    app.use(
        '/api/v1/TasksCreators',
        createProxyMiddleware({
            target: 'http://94.103.85.168:8080',
            changeOrigin: true,
        })
    );

    app.use(
        '/api/v1/Questions',
        createProxyMiddleware({
            target: 'http://94.103.85.168:8080',
            changeOrigin: true,
        })
    );

    // API аутентификации и пользователей (порт 8081)
    app.use(
        '/api/v1/Authentication',
        createProxyMiddleware({
            target: 'http://94.103.85.168:8081',
            changeOrigin: true,
        })
    );

    app.use(
        '/api/user',
        createProxyMiddleware({
            target: 'http://94.103.85.168:8081',
            changeOrigin: true,
        })
    );
};
module.exports = {
    collectCoverage: true,
    verbose: true,
    coverageThreshold: {
        // if I ever deploy this app, let's first try to have 80% coverage (at least)
        './src/**/*.js': {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },
    collectCoverageFrom: [ // TODO: cover every files 100% (if this project gets serious...)
        // './server.js',
        './src/server/**/*.js'
    ],
    setupFiles: [
        './tests/config/loadConfig.js'
    ],
    setupFilesAfterEnv: [ 'jest-extended' ],
    restoreMocks: true
}
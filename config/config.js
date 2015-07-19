var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')
  , env = process.env.NODE_ENV || 'development';

global.root = rootPath;

var config = {
    development: {
        root: rootPath,
        app: {
            name: 'GoGateway'
        },
        port: 3000,
        url: 'http://localhost:3000/',
        db: 'postgres://localhost/gogateway_development'
    },

    test: {
        root: rootPath,
        app: {
            name: 'GoGateway'
        },
        port: 3000,
        db: 'postgres://localhost/gogatway_test'
    },

    production: {
        root: rootPath,
        app: {
            name: 'GoGateway'
        },
        port: 3000,
        url: process.env.URL,
        db: process.env.DATABASE_URL
    }
};

module.exports = config[env];

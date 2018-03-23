var _ = require('lodash');

module.exports = function (grunt) {
    var constants = {};
    var environment = process.env.ENV || 'local';
    var defaultConfig = grunt.file.readJSON('app/config/default.json');
    var config = grunt.file.readJSON('app/config/' + environment + '.json');

    _.forEach(config, function (value, key) {
        config[key] = process.env[key] || config[key];
    });

    grunt.option('baseUrl', config.BASE_URL);

    config.ENV = environment === 'local' ? 'development' : environment;

    constants['configuration'] = {
        constants: {
            APP: {
                version: '<%= pkg.version %>'
            },
            CONFIG: _.defaults(config, defaultConfig)
        }
    };

    // application constants
    return {
        tasks: {
            ngconstant: constants
        }
    };
};

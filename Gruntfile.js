module.exports = function(grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks("gruntify-eslint");

    var pkg = grunt.file.readJSON('package.json');

    var options = {
        paths: {
            app: 'app',
            assets: 'app/assets',
            public: 'public',
            dist: 'app/dist',
            distAssets: 'app/dist/assets',
            index: 'app/dist/index.html',
            nosplash: 'app/dist/nosplash.html',
            indexDev: 'app/index.dev.html',
            indexLocal: 'app/index.html',
            indexTmp: '.tmp/html/index.html'
        },
        env: (process.env.ENV || 'local'),
        pkg: pkg
    };

    // Load grunt configurations automatically
    var configs = require('load-grunt-configs')(grunt, options);

    // Define the configuration for all the tasks
    grunt.initConfig(configs);

    grunt.registerTask('bumper', ['bump-only']);

    grunt.registerTask('default', [
        'ngconstant:configuration',
        'copy:dev',
        'replace:dev',
        'connect:server',
        'watch'
    ]);

    grunt.registerTask('dist', [
        'clean:demo',
        'copy:demo',
        'ngconstant:configuration',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin',
        'imagemin',
        'usebanner',
        'copy:postusemin',
        'copy:dist',
        'replace:dist',
        'grep:nosplash',
    ]);

    grunt.registerTask('public', [
        'copy:public',
        'grep:nopublic'
    ]);

    grunt.registerTask('lint', [ 'shell:outdated', 'csslint', 'eslint']);
};

module.exports = function () {
    return {
        tasks: {
            copy: {
                dev: {
                    files: [
                        { expand: true, src: '**', cwd: '<%= paths.app %>/bower_components/font-awesome/fonts',                    dest: '<%= paths.assets %>/fonts' },
                        { expand: true, src: '**', cwd: '<%= paths.app %>/bower_components/material-design-iconic-font/fonts',     dest: '<%= paths.assets %>/fonts' },
                        { expand: true, src: '**', cwd: '<%= paths.app %>/bower_components/bootstrap/dist/fonts', dest: '<%= paths.assets %>/fonts'}

                    ]
                }
            },

            // watch for changes during development
            watch: {
                js: {
                    files: ['Gruntfile.js', '<%= paths.assets %>/js/**/*.js'],
                    //tasks: ['jshint'],
                    options: {
                        livereload: 35731
                    }
                },
                css: {
                    files: [
                        '<%= paths.assets %>/css/**/*.css',
                    ],
                    options: {
                        livereload: 35731
                    }
                },
                html: {
                    files: [
                        '<%= paths.assets %>/tpl/**/*.html',
                        '<%= paths.indexDev %>'
                    ],
                    tasks: ['replace:dev'],
                    options: {
                        livereload: 35731
                    }
                },
                markdown: {
                    files: [
                        'README.md'
                    ],
                    tasks: ['markdown']
                }
            },

            // debug while developing
            jshint: {
                all: ['Gruntfile.js', '<%= paths.assets %>/js/**/*.js']
            },

            replace: {
                dev: {
                    options: {
                        patterns: [
                            {
                                match: 'dev',
                                replacement: '<%= pkg.version %>-dev'
                            },
                            {
                                match: 'local',
                                replacement: '<%= env %>'
                            }
                        ]
                    },
                    files: [{src: ['<%= paths.indexDev %>'], dest: '<%= paths.indexLocal %>'}]
                }
            },


            connect: {
                server: {
                    options: {
                        livereload: 35731,
                        base: 'app',
                        port: 3001
                    }
                }
            }
        }
    };
};

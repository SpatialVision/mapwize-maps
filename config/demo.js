module.exports = function (grunt) {
    return {
        tasks: {
            // clean generated files
            clean: {
                demo: [
                    '<%= paths.dist %>'
                ]
            },

            // copy files to correct folders
            copy: {
                demo: {
                    files: [
                        {src: '<%= paths.indexDev %>', dest: '<%= paths.indexTmp %>'},
                        { expand: true, src: '**', cwd: '<%= paths.app %>/bower_components/font-awesome/fonts', dest: '<%= paths.distAssets %>/fonts' },
                        { expand: true, src: '**', cwd: '<%= paths.app %>/bower_components/material-design-iconic-font/dist/fonts', dest: '<%= paths.distAssets %>/fonts' },
                        { expand: true, src: '**', cwd: '<%= paths.app %>/bower_components/bootstrap/dist/fonts', dest: '<%= paths.distAssets %>/fonts' },
                        { src: 'web.config', dest: '<%= paths.dist %>/web.config' },
                        { expand: true, src: '**', cwd: '<%= paths.assets %>/resources', dest: '<%= paths.distAssets %>/resources' },
                        { expand: true, src: [ '**/*', '!documentation.html' ], cwd: '<%= paths.assets %>/tpl', dest: '<%= paths.distAssets %>/tpl' },
                        { expand: true, src: '**/*', cwd: '<%= paths.app %>/pages', dest: '<%= paths.dist %>'},

                        { expand: true, src: '**/*', cwd: '<%= paths.app %>/assets/js/sdks/indoorLocation', dest: '<%= paths.dist %>/assets/js/sdks/indoorLocation'}
                    ]
                },
                postusemin: {
                    files: [
                        {src: '<%= paths.indexTmp %>', dest: '<%= paths.index %>'}
                    ]
                }
            },

            // set usemin working file
            useminPrepare: {
                html: '<%= paths.indexTmp %>',
                options: {
                    dest: '<%= paths.dist %>',
                    root: '<%= paths.app %>'
                }
            },

            // optimize images
            imagemin: {
                dynamic: {
                    files: [{
                        expand: true,
                        cwd: '<%= paths.assets %>/img/', // source images (not compressed)
                        src: ['**/*.{png,jpg,gif,svg,xml,json,ico}'], // Actual patterns to match
                        dest: '<%= paths.distAssets %>/img/' // Destination of compressed files
                    }]
                }
            },

            // add rev to bust cache
            filerev: {
                options: {
                    encoding: 'utf8',
                    algorithm: 'md5',
                    length: 20
                },
                release: {
                    src: [
                        '<%= paths.distAssets %>/**/*.js',
                        '<%= paths.distAssets %>/**/*.css'
                    ]
                }
            },

            // replace tags
            usemin: {
                html: ['<%= paths.indexTmp %>', '<%= paths.dist %>/*.html'],
                options: {
                    assetsDirs: ['<%= paths.dist %>'],
                    // This is a workaround so we can use the builds created from index.dev within other pages
                    patterns: {
                        html: [
                            [
                                /(<!-- reusebuild:css .+? -->[\s\S\r\n]*?<!-- endreusebuild -->)/gm,
                                'Re-use css build',
                                function (m) {
                                    return m.match(/[\/.a-z]*?\.css/gm)[0];
                                },
                                function (m) {
                                    var href = grunt.option('baseUrl') + m;
                                    return '<link href="' + href + '" rel="stylesheet" type="text/css" />';
                                }
                            ],
                            [
                                /(<!-- reusebuild:js .+? -->[\s\S\r\n]*?<!-- endreusebuild -->)/gm,
                                'Re-use js build',
                                function (m) {
                                    return m.match(/[\/.a-z]*?\.js/gm)[0];
                                },
                                function (m) {
                                    var href = grunt.option('baseUrl') + m;
                                    return '<script charset="utf-8" src="' + href + '"></script>';
                                }
                            ]
                        ]
                    },
                    blockReplacements: {
                        icon: function (block) {
                            var href = grunt.option('baseUrl') + block.dest;
                            var link = '<link rel="icon" type="image/png" href="' + href + '" />';
                            return link;
                        },
                        a: function (block) {
                            var regex = /href\s*=\s*("[^"]*"|'[^']*')/g;
                            var href = grunt.option('baseUrl') + block.dest;
                            return block.raw[1].trim().replace(regex, 'href="' + href + '"');
                        }
                    }
                }
            },

            // tag generated filenames for reference
            usebanner: {
                taskName: {
                    options: {
                        position: 'top',
                        banner: '/*! <%=  grunt.template.today("dd-mm-yyyy hh:MM:ss")  %> */',
                        linebreak: true
                    },
                    files: {
                        src: ['<%= paths.distAssets %>/*.css', '<%= paths.distAssets %>/*.js']
                    }
                }
            }
        }
    };
};

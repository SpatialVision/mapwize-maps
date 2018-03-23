module.exports.tasks = {
    // version update
    bump: {
        options: {
            files: ['package.json'],
            commitFiles: ['package.json'],
            commit: true,
            commitMessage: 'Bump to %VERSION%',
            createTag: false,
            push: false
        }
    },

    // application constants
    ngconstant: {
        options: {
            dest: '<%= paths.assets %>/js/app.constants.js',
            name: 'app.constants',
        }
    },

    // remove all bs from css
    cssmin: {
        options: {
            keepSpecialComments: 0
        }
    },

    markdown: {
        all: {
            files: [
                {
                    src: 'README.md',
                    dest: '<%= paths.assets %>/tpl/documentation.html'
                }
            ],
            options: {
                template: '<%= paths.assets %>/tpl/_documentation_template.html',
            }
        }
    },

    eslint: {
        src: ['./app/assets/js/**/*.js']
    },

    shell: {
        outdated: {
            command: 'npm outdated',
            options: {
                failOnError: false
            }
        }
    },

    csslint: {
        options: {
            csslintrc: '.csslintrc'
        },
        all: {
            src: ['./app/assets/css/**/*.css']
        }
    }
};

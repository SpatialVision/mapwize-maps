module.exports.tasks = {
    copy: {
        dist: {
            files: [
                { src: 'Gruntfile.js', dest: '.tmp/Gruntfile.js' }
            ]
        }
    },

    replace: {
        dist: {
            options: {
                patterns: [
                    {
                        match: 'dev',
                        replacement: '<%= pkg.version %>'
                    },
                    {
                        match: 'local',
                        replacement: '<%= env %>'
                    }
                ]
            },
            files: [
                {src: ['<%= paths.index %>'], dest: '<%= paths.index %>'}
            ]
        }
    },


    // lightweight env replacements for development
    grep: {
        nosplash: {
            files: {
                '<%= paths.nosplash %>': ['<%= paths.index %>'],
            },
            options: {
                pattern: 'nosplash'
            }
        }
    }

};

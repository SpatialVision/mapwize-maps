module.exports.tasks = {
    copy: {
        public: {
            files: [
                { src: '<%= paths.indexDev %>', dest: '<%= paths.public %>/<%= paths.indexDev %>'},
                { expand: true, src: '**', cwd: '<%= paths.assets %>', dest: '<%= paths.public %>/<%= paths.assets %>' },
                { expand: true, src: '**', cwd: '<%= paths.app %>/pages', dest: '<%= paths.public %>/<%= paths.app %>/pages' },
                { src: '<%= paths.app %>/config/default.json', dest: '<%= paths.public %>/<%= paths.app %>/config/default.json' },
                { src: '<%= paths.app %>/config/public.json', dest: '<%= paths.public %>/<%= paths.app %>/config/local.json' },
                { expand: true, src: '**', cwd: 'config', dest: '<%= paths.public %>/config' },
                { expand: true, src: '**', cwd: 'docker', dest: '<%= paths.public %>/docker' },
                { src: '.bowerrc', dest: '<%= paths.public %>/.bowerrc' },
                { src: '.dockerignore', dest: '<%= paths.public %>/.dockerignore' },
                { src: '.gitignore', dest: '<%= paths.public %>/.gitignore' },
                { src: 'bower.json', dest: '<%= paths.public %>/bower.json' },
                { src: 'Gruntfile.js', dest: '<%= paths.public %>/Gruntfile.js' },
                { src: 'package.json', dest: '<%= paths.public %>/package.json' },
                { src: 'docs.md', dest: '<%= paths.public %>/README.md' },
            ]
        }
    },

    // lightweight env replacements for development
    grep: {
        nopublic: {
            files: {
                '<%= paths.public %>/<%= paths.indexDev %>': ['<%= paths.public %>/<%= paths.indexDev %>'],
                '<%= paths.public %>/app/assets/js/app.js': ['<%= paths.public %>/app/assets/js/app.js'],
                '<%= paths.public %>/app/assets/js/app.config.js': ['<%= paths.public %>/app/assets/js/app.config.js'],
            },
            options: {
                fileOverride: true,
                pattern: 'nopublic'
            }
        }
    }

};

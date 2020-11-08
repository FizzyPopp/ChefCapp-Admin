module.exports = function(grunt) {
    let firebase = require("./firebase.json");
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        deployFirebase: {
            a : [1, 2, 3],
            bar: 'hello world',
            baz: false
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('build', ['step1', 'step2', 'step3']);
    grunt.registerTask('deploy', ['step1', 'step2', 'step3']);
    grunt.registerMultiTask('log', 'Log stuff.', () => {
        grunt.log.writeln(this.target + ': ' + this.data);
    });
};

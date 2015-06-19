/*global module:false*/
module.exports = function(grunt) {
    var src = [
        'src/utils/Polyfill.js',
        'src/build/Header.js',
        'src/Engine.js',
        'src/utils/Utils.js',
        'src/math/Math.js',
        'src/math/Arc.js',
        'src/math/Circle.js',
        'src/math/Ellipse.js',
        'src/math/Line.js',
        'src/math/Matrix.js',
        'src/math/Point.js',
        'src/math/Poly.js',
        'src/math/Rect.js',
        'src/system/Browser.js',
        'src/system/Capabilities.js',
        'src/system/Device.js',
        'src/system/Os.js',
        'src/system/Screen.js',
        'src/render/common/Color.js',
        'src/render/common/Texture.js',
        'src/render/common/Shape.js',
        'src/render/Render.js',
        'src/render/canvas/CanvasGraphics.js',
        'src/render/canvas/CanvasTexture.js',
        'src/render/canvas/CanvasTinter.js',
        'src/render/canvas/CanvasRender.js',
        'src/render/webgl/WebglShader.js',
        'src/render/webgl/shaders/*.js',
        'src/render/webgl/WebglGraphics.js',
        'src/render/webgl/WebglTexture.js',
        'src/render/webgl/WebglBatch.js',
        'src/render/webgl/WebglRender.js',
        'src/input/mouse/MouseEvent.js',
        'src/input/mouse/Mouse.js',
        'src/input/keyboard/KeyboardEvent.js',
        'src/input/keyboard/Keyboard.js',
        'src/input/touch/TouchPoint.js',
        'src/input/touch/TouchList.js',
        'src/input/touch/TouchEvent.js',
        'src/input/touch/Touch.js',
        'src/scene/Object.js',
        'src/scene/Sprite.js',
        'src/scene/Transform.js',
        'src/build/Footer.js'
    ];
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: src,
                dest: 'dist/<%= pkg.name %>.dev.js'
            }
        },
        concat_sourcemap: {
            options: {
                sourceRoot: '../'
            },
            target: {
                files: {
                    'dist/<%= pkg.name %>.dev.js': src
                }
            }
        },
        jshint: {
            source: {
                src: [
                    'src/Engine.js', 'src/**/*.js'],
                options: {
                    jshintrc: true,
                    ignores: ['src/build/**/*.js', 'src/utils/Polyfill.js']
                }
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        jsdoc : {
            dist : {
                jsdoc: '/usr/bin/jsdoc',
                options: {
                    private: false,
                    destination: 'docs',
                    configure: 'jsdoc.json'
                }
            }
        },
        watch: {
            files: ['gruntfile.js', '.jshintrc', 'src/**/*.js'],
            tasks: ['default']
        }
    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-concat-sourcemap');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task
    grunt.registerTask('default', ['jshint', 'concat', 'concat_sourcemap', 'uglify', 'jsdoc']);
    grunt.registerTask('check', ['jshint']);
    grunt.registerTask('docs', ['jsdoc']);
};

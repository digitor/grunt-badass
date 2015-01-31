/*
 * grunt-badass
 * http://github.com/jimdoyle82/grunt-badass
 *
 * Copyright (c) 2014 Jim Doyle
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		jshint: {
		  all: [
			'Gruntfile.js'
			,'tasks/*.js'
			// ,'<%= nodeunit.tests %>'
		  ],
		  options: {
			jshintrc: '.jshintrc'
		  },
		}

		// Unit tests.
		,jasmine_node: {
			badass: {
				src: ["tests/**/*spec.js"] // for coverage
				,options: {
					coverage: {} // using istanbul defaults
					,specFolders: ['tests']
					,captureExceptions: true
					,showColors: true
					// ,forceExit: true
				}
			}
		}

		,badass: {
			dist: {
				src: 'tests/resources/svgs/'
				,dest: "dist/"
				,options: {
					cssPrefix: "bad" // sprites will take this folder name as part of class name, so keep it short

					// if 'standAlone' is marked as true, files will get copied to this directory
					,standAlonePngDir: "dist/singles/"
					,spriteUrl: "/_dist/deploy/img/sprites/dmicon-s501a7eb4b9.png"
					,spriteOutput: "dist/sprite.png"

					// ,svgDir: "dist/tmp/myicons-svgs/"
					,stylesOutput: "dist/icons.scss" // this would be ".css" if not using scss in your project
					,items: [
						 { filename: "camera", class: "camera-warm", w: 50, h:44, fillCol: "orange" }
						,{ filename: "camera", class: "camera-cold", w: 50, h:44, fillCol: "blue", standAlone: true }
						,{ filename: "cloud", class: "cloud-down", w: 50, h:41, fillCol: "#999" }
						,{ filename: "code", class: "code-sm-bright", w: 50, h:38, fillCol: "yellow" }
						,{ filename: "code", class: "code-md-bright", w: 60, h:45, fillCol: "yellow" }
						,{ filename: "code", class: "code-lg-bright", w: 80, h:60, fillCol: "yellow" }
					]
				}
			}
			,test1: require("./tests/grunt_configs/test1.js").test
			,test2: require("./tests/grunt_configs/test2.js").test
		}

		,clean: {
			tests: ["dist/test1", "dist/test2",  "dist/test3"]
		}

	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	
	grunt.loadTasks('subtrees/grunt-jasmine-node-coverage/tasks');
	// grunt.loadNpmTasks('grunt-jasmine-node-coverage');

	// use grunt option --dirty=true to skip the clean
	grunt.registerTask('test', ['badass:test1', 'badass:test2', 'jasmine_node:badass'].concat( grunt.option("dirty") ? [] : ["clean:tests"] ) );
	// grunt.registerTask('test', ['copy', 'clean', 'jasmine_node']);

	grunt.registerTask('default', ['jshint', 'test', 'badass']);
};

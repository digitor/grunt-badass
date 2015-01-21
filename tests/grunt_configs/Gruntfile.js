'use strict';
module.exports = function(grunt) {

	grunt.initConfig({

		rootDir: process.cwd() + "/../../"
		,badass: {
			dist: {
				src: '<%= rootDir %>tests/resources/'
				,dest: "<%= rootDir %>dist/"
				,options: {
					pngDir: "bad" // sprites will take this folder name as part of class name, so keep it short

					// if 'standAlone' is marked as true, files will get copied to this directory
					,standAlonePngDir: "<%= rootDir %>dist/singles/"

					,svgDir: "<%= rootDir %>tmp/myicons-svgs/"
					,scssOutput: "<%= rootDir %>dist/icons.scss"
					,cwd: "<%= rootDir %>"
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
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks( grunt.config("rootDir")+'tasks');
	grunt.registerTask('default', ['badass']);
};

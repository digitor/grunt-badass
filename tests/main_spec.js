'use strict';

var _ = require("lodash-node")
	,shell = require("shelljs")
	,fse = require("fs-extra")
	,parserlib = require("parserlib") // for linting CSS
	,cwd = process.cwd()
	,DEF_COL = "BADA55";


describe("test 1 - check generated files and folders", function() {

	var originalTimeout;

	beforeEach(function() {
		originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
  		jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
	});


	afterEach(function() {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
	});
	
	/**
	 * Lodash template used just for converting path vars
	 */
	var rootDirObj = { rootDir: "./" }
		,config = require("./grunt_configs/test1.js").test
		,COMPASS_SPRITE_DIR = _.template( config.dest, rootDirObj )
		,STAND_ALONE_PNG_DIR = _.template( config.options.standAlonePngDir, rootDirObj )
		,PNG_DIR = COMPASS_SPRITE_DIR+config.options.cssPrefix+"/";
	
	gruntTest(1);


	it("should check task resources exist", function() {
		expect( fse.existsSync("./tasks/resources/icons.css") ).toBe( true );
		expect( fse.existsSync("./tasks/resources/svgloader.js") ).toBe( true );
	});


	it("should have created a css file for icons which should no longer contains any template syntax.", function(done) {		

		expect( fse.existsSync(COMPASS_SPRITE_DIR+"icons.css") ).toBe( true );

		var css = fse.readFileSync(COMPASS_SPRITE_DIR+"icons.css").toString();
		expect( css.indexOf("<%=") ).toEqual(-1);

		lintCSS( done, css );
	});


	it( "should check that all SVG icons have had corresponding PNGs generated", function() {
		expect( fse.existsSync(PNG_DIR) ).toBe( true );
		
		config.options.items.forEach( function(item, i) {
			var pngIcon = PNG_DIR+item.class+".png";
			expect( fse.existsSync(pngIcon) ).toBe( true );
		});
	});


	it("should check that specified stand alone pngs have been generate", function() {
		
		expect( fse.existsSync(STAND_ALONE_PNG_DIR) ).toBe( true );

		config.options.items.forEach(function(item) {
			if( item.standAlone ) 
				expect( fse.existsSync( STAND_ALONE_PNG_DIR+item.class+".png" ) ).toBe( true );
		});
	});


	// TODO: test file names are css compatible

	/*it("should have copied the `svgloader.js` file into dist.", function() {		
		expect( fse.existsSync("./dist/test1/svgloader.js") ).toBe( true );
	});*/

});


describe("badass testable methods", function() {

	var badass = require("../tasks/badass.js")
		,testableMethods = badass( require("grunt") ).tests

	describe("replaceBetween()", function() {
		var START = "{{START}}"
			,END = "{{END}}";

		it("should replace 'love' with 'money' and no longer contain delimeters", function() {
			
			var originalStr = "I need your "+START+"love"+END+"."
				,modifiedStr = testableMethods.replaceBetween( START, END, originalStr, 'money' );

			expect( modifiedStr ).toBe("I need your money.");
		});

		it("should replace 'time' with 'sugar' and still contain delimeters", function() {
			var originalStr = "I need your "+START+"time"+END+"."
				,modifiedStr = testableMethods.replaceBetween( START, END, originalStr, 'sugar', true );

			expect( modifiedStr ).toBe("I need your "+START+"sugar"+END+".");
		});

		it("should replace a string containing a line break with an empty string and no longer contain delimeters", function() {
			var originalStr = "I need "+START+"a break \n from "+END+"you."
				,modifiedStr = testableMethods.replaceBetween( START, END, originalStr );

			expect( modifiedStr ).toBe("I need you.");
		});

		it("should replace a string containing a '*' symbol in its delimeters", function() {
			var start = "{{START*}}"
				,end = "{{END*}}"
				,originalStr = "'asterisk' "+start+"not 'asteriks' "+end+"is a common mistake."
				,modifiedStr = testableMethods.replaceBetween( start, end, originalStr );

			expect( modifiedStr ).toBe("'asterisk' is a common mistake.");
		});

		it("should replace a string containing a '?' symbol in its delimeters", function() {
			var start = "{{START?}}"
				,end = "{{END?}}"
				,originalStr = "What's the "+start+"meaning of this "+end+"question?"
				,modifiedStr = testableMethods.replaceBetween( start, end, originalStr );

			expect( modifiedStr ).toBe("What's the question?");
		});
	});
	

	describe("getClassesByProp()", function() {

		it("should return specific CSS with 'fillCol' property", function(done) {
			
			var returnedStr = callSimple();

			expect( trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{fill:#999;}");

			lintCSS( done, returnedStr );
		});


		describe("specific CSS with 'strokeCol' property", function() {

			var cssPrefix = "bad"
				,item = {
					filename: "cloud"
					,class: "cloud-down"
					,w:50
					,h:41
					,strokeCol: "#999"
				}
				,propName = "strokeCol"
				,cssPropName = "stroke";

			it("should have specified hex value, when 'inclNone' is false", function(done) {
				
				var inclNone = false
					,thisItem = _.clone(item);

				var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );

				// expect result, based on 'strokeCol' property having a value in object with 'items' array. 
				expect( trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{stroke:#999;}");

				lintCSS( done, returnedStr );
			});


			it("should have specified hex value, when 'inclNone' is true, showing it doesn't matter what this value is if property exists and ISN'T a falsey", function(done) {
				
				var inclNone = true
					,thisItem = _.clone(item);

				var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );

				// expect result, based on 'strokeCol' property having a value in object with 'items' array. 
				expect( trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{stroke:#999;}");

				lintCSS( done, returnedStr );
			});


			it("should have 'transparent' value, when 'inclNone' is true and if property IS a falsey", function(done) {
				
				var inclNone = true
					,thisItem = _.clone(item);

				thisItem.strokeCol = undefined;

				var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );

				expect( trimAllWhite(returnedStr) ).toBe(".bad-cloud-down{stroke:transparent;}");

				lintCSS( done, returnedStr );
			});


			it("should return an empty string, when 'inclNone' is false and if property IS a falsey", function() {
				
				var inclNone = false
					,thisItem = _.clone(item);

				thisItem.strokeCol = undefined;

				var returnedStr = testableMethods.getClassesByProp( cssPrefix, [thisItem], propName, cssPropName, inclNone );
				
				expect( returnedStr ).toBe("");
			});
		});


		function callSimple() {
			var cssPrefix = "bad"
				,items = [{
					filename: "cloud"
					,class: "cloud-down"
					,w:50
					,h:41
					,fillCol: "#999"
				}]
				,propName = "fillCol"
				,cssPropName = "fill"
				,inclNone = true;

			return testableMethods.getClassesByProp( cssPrefix, items, propName, cssPropName, inclNone );
		}
	});


	describe("saveScss()", function() {
		it("should save css in given location, ensuring 'includeCompassSpriteStyles' is false and lint it", function(done) {
			var cssPrefix = "bad"
				,items = [{
					filename: "cloud"
					,class: "cloud-down"
					,w:50
					,h:41
					,strokeCol: "#999"
				}]
				,scssOutput = cwd + "/dist/test1/tmp/icons.css"
				// can only lint if 'includeCompassSpriteStyles' is false, as it will add scss specific styles
				,includeCompassSpriteStyles = false;

			testableMethods.saveScss( includeCompassSpriteStyles, cssPrefix, cwd + "/", scssOutput, items );

			// ensure file exists before reading it
			expect( fse.existsSync( scssOutput ) ).toBe( true );

			// Lint it to make sure it is valid CSS
			var css = fse.readFileSync( scssOutput ).toString();
			lintCSS( done, css )
		});
	});


	describe("copySafeSrc()", function() {

		var srcPath = "./tests/resources/svgs/"
			,destPath = "./dist/test1/safe-svgs/";

		testableMethods.copySafeSrc( DEF_COL, srcPath, destPath );

		it("should verify that all '.svg' files have been copied to 'dest' directory", function() {

			var srcFileNames = fse.readdirSync( srcPath )
				,destFileNames = fse.readdirSync( destPath );

			expect( _.isEqual(srcFileNames, destFileNames) ).toBe( true );
		});

		it("should check that svgs have had references to BADASS removed", function() {

			var srcFileNames = fse.readdirSync( srcPath );

			srcFileNames.forEach(function(fileName) {

				var destContents = fse.readFileSync( destPath + fileName ).toString();

				expect( destContents.indexOf("#"+DEF_COL) ).toEqual( -1 );
				expect( destContents.indexOf("#"+DEF_COL.toLowerCase()) ).toEqual( -1 );
			});

		});
	});


	describe("replaceTag()", function() {
		it("should replace default fill colour with a custom one", function() {

			var svgContents = fse.readFileSync( "./tests/resources/svgs/camera.svg" ).toString()
				,tag = 'fill="#'+DEF_COL+'"'

			// Check the tag exists first
			expect( svgContents.indexOf(tag) ).not.toEqual( -1 );
			
			svgContents = testableMethods.replaceTag( tag, "fill", "#999", svgContents );

			// Check tag no longer exists
			expect( svgContents.indexOf(tag) ).toEqual( -1 );

			// Check the new tag exists now
			expect( svgContents.indexOf('fill="#999') ).not.toEqual( -1 );
		})
	});


	describe("removeAttr()", function() {
		it("should remove the attributes from the svg sample", function() {

			var svgSample = '<svg width="50px" height="40px"><path fill="#'+DEF_COL+'"></path></svg>';

			var widthResult = testableMethods.removeAttr( "svg", "width", svgSample );
			expect( widthResult ).toBe( '<svg  height="40px"><path fill="#'+DEF_COL+'"></path></svg>' );
			
			var heightResult = testableMethods.removeAttr( "svg", "height", svgSample );
			expect( heightResult ).toBe( '<svg width="50px" ><path fill="#'+DEF_COL+'"></path></svg>' );
			
			var fillResult = testableMethods.removeAttr( "path", "fill", svgSample );
			expect( fillResult ).toBe( '<svg width="50px" height="40px"><path ></path></svg>' );
		});
	});


	describe("coloursAndSizes()", function() {
		var items = [
			{
				filename: 'camera',
				class: 'camera-warm',
				w: 50,
				h: 44,
				fillCol: 'orange'
			},{
				filename: 'camera',
				class: 'camera-cold',
				w: 50,
				h: 44,
				fillCol: 'blue',
				standAlone: true
			}
		]
		,svgSrcDir = "./tests/resources/svgs/"

		it("should check that xml header has been added to svg, if missing", function() {
			
			var tempSrc = "./dist/test1/tmp-colours-and-sizes-xml/"
				,svgTempDir = "./dist/test1/tmp-svgs-xml/";

			createTempSrc( "xml", "camera.svg" );
			replaceBetweenSvg( "xml", "camera.svg", "<?xml", "?>" );

			// run the method we're testing
			testableMethods.coloursAndSizes( DEF_COL, tempSrc, items, svgTempDir );

			// verify that every svg has the <?xml tag
			fse.readdirSync( svgTempDir ).forEach(function(fileName) {
				if( fileName.lastIndexOf(".svg") === fileName.length-4 ) {
					var fileContents = fse.readFileSync( svgTempDir + fileName ).toString();
					expect( fileContents.indexOf("<?xml") ).not.toEqual(-1);
				}
			});
		});

		it("should check that <symbol> tags have been replaced by <g> tags", function() {
			var tempSrc = "./dist/test1/tmp-colours-and-sizes-symbol/"
				,svgTempDir = "./dist/test1/tmp-svgs-symbol/";

			// make sure svg has a <symbol> tag
			createTempSrc( "symbol", "camera.svg" );
			replacePartSvg( "symbol", "camera.svg", "<g", "<symbol" );
			replacePartSvg( "symbol", "camera.svg", "/g>", "/symbol>" );
			
			// run the method we're testing
			testableMethods.coloursAndSizes( DEF_COL, tempSrc, items, svgTempDir );

			// verify that every svg has the <g> tag instead of <symbol>
			fse.readdirSync( svgTempDir ).forEach(function(fileName) {
				if( fileName.lastIndexOf(".svg") === fileName.length-4 ) {
					var fileContents = fse.readFileSync( svgTempDir + fileName ).toString();
					
					expect( fileContents.indexOf("<symbol") ).toEqual(-1);
					expect( fileContents.indexOf("<g") ).not.toEqual(-1);

					expect( fileContents.indexOf("g>") ).not.toEqual(-1);
					expect( fileContents.indexOf("symbol>") ).toEqual(-1);
				}
			});
		});

		it("should check that 'xmlns' attribute is present on the <svg> tag", function() {
			var tempSrc = "./dist/test1/tmp-colours-and-sizes-xmlns/"
				,svgTempDir = "./dist/test1/tmp-svgs-xmlns/"

			createTempSrc( "xmlns", "camera.svg" );
			replaceBetweenSvg( "xmlns", "camera.svg", 'xmlns="', '"' );
			
			// run the method we're testing
			testableMethods.coloursAndSizes( DEF_COL, tempSrc, items, svgTempDir );

			// verify that every svg has the 'xmlns' attribute
			fse.readdirSync( svgTempDir ).forEach(function(fileName) {
				if( fileName.lastIndexOf(".svg") === fileName.length-4 ) {
					var fileContents = fse.readFileSync( svgTempDir + fileName ).toString();
					expect( fileContents.indexOf('xmlns="http://www.w3.org/2000/svg"') ).not.toEqual(-1);
				}
			});
		});

		it("should check that svg file name uses 'class' specified in item's object", function() {
			/**
			 * If 'class' is specified, it should use it as the file name
			 */

			var svgTempDir = "./dist/test1/tmp-svgs-classes1/";

			testableMethods.coloursAndSizes( DEF_COL, svgSrcDir, items, svgTempDir );

			items.forEach(function( item ) {
				expect( fse.existsSync(svgTempDir+item.class+".svg") ).toBe( true );
			});
		});

		it("should check that svg file name creates a base name if no 'class' specified in item's object", function() {
			/**
			 * If 'class' not specified, it should create a base name from file name, width, height, fill and stroke values
			 */

			var svgTempDir = "./dist/test1/tmp-svgs-classes2/"
				,item = {
					filename: 'camera'
					,class: null
					,w: 50
					,h: 44
					,fillCol: 'blue'
				}

			testableMethods.coloursAndSizes( DEF_COL, svgSrcDir, [item], svgTempDir );

			expect( fse.existsSync(svgTempDir+item.filename + "-w"+item.w + "-h"+item.h + "-fc-"+item.fillCol + ".svg") ).toBe( true );
		});

		it("should check that 'width' and 'height' attributes only exist once per svg", function() {
			/**
			 * If width and height attributes exist more than once on an svg, it screws up svgToPng
			 */

			var svgTempDir = "./dist/test1/tmp-svgs-wh/";

			testableMethods.coloursAndSizes( DEF_COL, svgSrcDir, items, svgTempDir );

			fse.readdirSync( svgTempDir ).forEach(function(fileName) {
				if( fileName.lastIndexOf(".svg") === fileName.length-4 ) {
					var fileContents = fse.readFileSync( svgTempDir + fileName ).toString();

					// needs space before it so 'stroke-width' doesn't get detected
					expect( fileContents.split(' width=').length ).toEqual( 2 );
					expect( fileContents.split(' height=').length ).toEqual( 2 );
				}
			});
		});

		it("should check that fill colour, stroke colour & stroke width get replaced with config values", function() {
			var svgTempDir = "./dist/test1/tmp-svgs-stroke-col/"
				,item = {
					filename: 'camera'
					,class: "camera-cold"
					,w: 50
					,h: 44
					,fillCol: 'blue'
					,strokeCol: 'red'
					,strokeWidth: '3'
				}

			testableMethods.coloursAndSizes( DEF_COL, svgSrcDir, [item], svgTempDir );

			var fileContents = fse.readFileSync( svgTempDir+item.class + ".svg" ).toString();
			expect( fileContents.indexOf('fill="blue"') ).not.toEqual(-1);
			expect( fileContents.indexOf('stroke="red"') ).not.toEqual(-1);
			expect( fileContents.indexOf('stroke-width="3"') ).not.toEqual(-1);
		});


		it("should check that stroke and fill colours get replaced with 'transparent' and stroke width an 'almostZero' number when omitted from config", function() {
			var svgTempDir = "./dist/test1/tmp-svgs-stroke-trans/"
				,item = {
					filename: 'camera'
					,class: "camera-cold"
					,w: 50
					,h: 44
					// 'fillCol', 'strokeCol' & 'strokeWidth' deliberately omitted for test
				}

			testableMethods.coloursAndSizes( DEF_COL, svgSrcDir, [item], svgTempDir );

			var fileContents = fse.readFileSync( svgTempDir+item.class + ".svg" ).toString();

			expect( fileContents.indexOf('fill="transparent"') ).not.toEqual(-1);
			expect( fileContents.indexOf('stroke="transparent"') ).not.toEqual(-1);

			var almostZero = "0.0001";
			expect( fileContents.indexOf('stroke-width="'+almostZero+'"') ).not.toEqual(-1);
		});

		

		function createTempSrc( testId, svgFileName ) {
			var tempSrc = "./dist/test1/tmp-colours-and-sizes-"+testId+"/"

			// copy files to a temp folder so we can modify them for test only
			fse.ensureDirSync( tempSrc );
			fse.copySync( svgSrcDir + svgFileName, tempSrc + svgFileName );
		}

		function replaceBetweenSvg( testId, svgFileName, start, end ) {
			var tempSrc = "./dist/test1/tmp-colours-and-sizes-"+testId+"/"

			// modify the svg, so we can test without ruining original
			var svgContents = fse.readFileSync( tempSrc + svgFileName ).toString();
			svgContents = testableMethods.replaceBetween(start, end, svgContents );
			fse.outputFile( tempSrc + svgFileName, svgContents );
		}

		function replacePartSvg( testId, svgFileName, orig, repl ) {
			var tempSrc = "./dist/test1/tmp-colours-and-sizes-"+testId+"/"

			// modify the svg, so we can test without ruining original
			var svgContents = fse.readFileSync( tempSrc + svgFileName ).toString();
			svgContents = svgContents.split( orig ).join( repl );
			fse.outputFile( tempSrc + svgFileName, svgContents );
		}
	});

	describe("getFileBaseName()", function() {
		it("should check file base name uses item properties when 'class' not specified", function() {
			/**
			 * If 'class' not specified, it should create a base name from file name, width, height, fill and stroke values
			 */

			var item = {
					filename: 'camera'
					,class: null
					,w: 50
					,h: 44
					,fillCol: 'blue'
					,strokeCol: 'red'
					,strokeWidth: '3'
				}

			var fileBaseName = testableMethods.getFileBaseName( item );

			expect( fileBaseName ).toBe(	item.filename + 
											"-w"+item.w + 
											"-h"+item.h + 
											"-sw-"+item.strokeWidth +
											"-sc-"+item.strokeCol +
											"-fc-"+item.fillCol
										);
		});
	});

	describe("copyStandAlonePngs()", function() {
		it("should check that only items/icons with 'standAlone' property set to true get copied from 'pngDir' to 'standAlonePngDir'.", function() {
			
			var pngDir = "./tests/resources/pngs/"
			,standAlonePngDir = "./dist/test1/tmp-copy-stand-alone-pngs/"
			,items = [
				{
					filename: 'camera',
					class: 'camera-warm',
					standAlone: true
				},{
					filename: 'camera',
					class: 'camera-cold'
				}
			]

			testableMethods.copyStandAlonePngs( items, pngDir, standAlonePngDir );

			expect( fse.existsSync( standAlonePngDir + "camera-warm.png" ) ).toBe( true );
			expect( fse.existsSync( standAlonePngDir + "camera-cold.png" ) ).toBe( false );
		});
	});

	describe("generateSprite()", function() {
		it("should confirm the creation of a png and valid css file", function(done) {

			var spriteUrl = "/some/path/to/sprite.png"
			,cssPrefix = "bad"
			,scssOutput = "./dist/test1/tmp-generate-sprite/icons.css"
			,spriteOutput = "./dist/test1/tmp-generate-sprite/sprite.png"
			,pngDir = "./tests/resources/pngs/"
			,items = [
				{
					filename: 'camera',
					class: 'camera-warm',
					w: 50,
					h: 44,
					fillCol: 'orange'
				},{
					filename: 'camera',
					class: 'camera-cold',
					w: 50,
					h: 44,
					fillCol: 'blue'
				}
			];

			// first create an empty css file, so we can modify it. In the plugin, this is done before calling this method.
			fse.outputFileSync( scssOutput, "" );

			testableMethods.generateSprite( spriteUrl, spriteOutput, cssPrefix, scssOutput, items, pngDir, function() {
				
				expect( fse.existsSync(spriteOutput) ).toBe( true );
				expect( fse.existsSync(scssOutput) ).toBe( true );
				lintCSS(done, fse.readFileSync(scssOutput) );
			});
		});
	});
});


describe("cleanup", function() {
	it("should clean up the dist folder", function() {
		fse.removeSync( "./dist/test1" );
		expect( fse.existsSync("./dist/test1") ).toBe( false );
	});
});

function gruntTest( number ) {
	process.chdir("tests/grunt_configs/");
	var result = shell.exec("grunt badass:test"+number, {silent:true});
	process.chdir(cwd);
}


function lintCSS( done, returnedStr ) {
	// Now we lint the CSS
	var parser = new parserlib.css.Parser();

	// will get changed to true in error handler if errors detected
	var errorsFound = false;

	parser.addListener("error", function(event){
	    console.log("Parse error: " + event.message + " (" + event.line + "," + event.col + ")", "error");
	    errorsFound = true;
	});

	parser.addListener("endstylesheet", function(){
	    console.log("Finished parsing style sheet");

		expect( errorsFound ).toBe( false );

		// finish the test
	    done();
	});
	
	parser.parse( returnedStr );
}


function trimAllWhite(str) {
	return str.replace(/\s+/g, '');
}
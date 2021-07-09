var gl;
var baseDir;
var shaderDir;
var image;

var models = new Array();
var vaos = new Array();

var program;

var cubeWorldMatrices =  new Array();
cubeWorldMatrices[0] = new Array();
cubeWorldMatrices[0][0] = new Array();

var positionAttributeLocation;
var normalsAttributeLocation;

var uvLocation;
var textureFileHandle;
var texture;

var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
var elevation = -15.0;
var angle = 0.0;

var lookRadius = 23.0;

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;

function doMouseDown(event) {
	lastMouseX = event.pageX;
	lastMouseY = event.pageY;
	mouseState = true;
}

function doMouseUp(event) {
	lastMouseX = -100;
	lastMouseY = -100;
	mouseState = false;
}

function doMouseMove(event) {
	if(mouseState) {
		var dx = event.pageX - lastMouseX;
		var dy = lastMouseY - event.pageY;
		lastMouseX = event.pageX;
		lastMouseY = event.pageY;
		
		if((dx != 0) || (dy != 0)) {
			angle = angle + 0.5 * dx;
			elevation = elevation + 0.5 * dy;
		}
	}
}

function doMouseWheel(event) {
	var nLookRadius = lookRadius + event.wheelDelta/200.0;
	if((nLookRadius > 2.0) && (nLookRadius < 100.0)) {
		lookRadius = nLookRadius;
	}
}

var keyFunctionDown = function(e) {
	switch(e.keyCode) {
  		case 87:
			console.log("KeyUp - White");
			break;
	  	case 89:
			console.log("KeyUp - Yellow");
			break;
	  	case 66:
			console.log("KeyUp - Blue");
			break;
	  	case 71:
			console.log("KeyUp - Green");
			break;
	  	case 82:
			console.log("KeyUp - Red");
			break;
	  	case 79:
			console.log("KeyUp - Orange");
			break;
		case 39:
			console.log("KeyUp - Right");
			break;
	  	case 37:
			console.log("KeyUp - Left");
			break;	
	}
}

async function importObject(name) { 
    var objStr = await utils.get_objstr("assets/" + name + ".obj");
    var objModel = new OBJ.Mesh(objStr);
    return objModel;
}

function main() {
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    //gl.enable(gl.CULL_FACE);
		
	positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	uvLocation = gl.getAttribLocation(program, "a_uv");
	//normalsAttributeLocation = gl.getAttribLocation(programs[0], "a_normal");
	textureFileHandle = gl.getUniformLocation(program, "a_texture");
	
	for(let i = 0; i < 26; i++){
		vaos[i] = gl.createVertexArray();
		gl.bindVertexArray(vaos[i]);

		var positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].vertices), gl.STATIC_DRAW);

		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

		/*var normalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].normals), gl.STATIC_DRAW);
		console.log(models[i].indices);
		gl.enableVertexAttribArray(normalsAttributeLocation);
		gl.vertexAttribPointer(normalsAttributeLocation, 3, gl.FLOAT, false, 0, 0);*/

		var indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(models[i].indices), gl.STATIC_DRAW);

		var uvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].textures), gl.STATIC_DRAW);
		gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(uvLocation);
	}
	
    drawScene();
}

function animate(){
	
}

//fare 26 programsmi per fare le animazioni
function drawScene() {
	
	animate();
	
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	let count = 0;
	for(let i = 0; i < 3; i++)
		for (let j = 0; j < 3; j++)
			for (let k = 0; k < 3; k++) {
				if (!(i === 1 && j === 1 && k === 1)) {
					//console.log(count);
					gl.useProgram(program);
				
					var perspectiveMatrix = utils.MakePerspective(30, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
					
					cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
					cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
					cy = lookRadius * Math.sin(utils.degToRad(-elevation));
					
					var viewMatrix = utils.MakeView(cx, cy, cz, elevation,angle);

					var matrixLocation = gl.getUniformLocation(program, "matrix");
					var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
					var worldMatrixLocation = gl.getUniformLocation(program, 'worldMatrix');
					
					var normalMatrix = utils.invertMatrix(utils.transposeMatrix(cubeWorldMatrices[i][j][k]));

					var viewWorldMatrix = utils.multiplyMatrices(viewMatrix,cubeWorldMatrices[i][j][k]);
					var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
					
					gl.uniformMatrix4fv(matrixLocation , gl.FALSE, utils.transposeMatrix(projectionMatrix));
					gl.uniformMatrix4fv(normalMatrixPositionHandle , gl.FALSE, utils.transposeMatrix(normalMatrix));
					gl.uniformMatrix4fv(worldMatrixLocation , gl.FALSE, utils.transposeMatrix(cubeWorldMatrices[i][j][k]));

					gl.bindVertexArray(vaos[count]);

					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, texture);
					gl.uniform1i(textureFileHandle, 0);
					
					gl.drawElements(gl.TRIANGLES, models[count].indices.length, gl.UNSIGNED_SHORT, 0);
					count++;
				}
			}
	
	window.requestAnimationFrame(drawScene);
}

async function init() {
    
    var canvas = document.getElementById("c");
	
	canvas.addEventListener("mousedown", doMouseDown, false);
	canvas.addEventListener("mouseup", doMouseUp, false);
	canvas.addEventListener("mousemove", doMouseMove, false);
	canvas.addEventListener("mousewheel", doMouseWheel, false);
	
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
	
    utils.resizeCanvasToDisplaySize(gl.canvas);

    image = new Image();
    image.src = "assets/Rubiks Cube.png";
    image.onload = function(e){
    	texture = gl.createTexture();
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, texture);

	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	    gl.generateMipmap(gl.TEXTURE_2D);

	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	    gl.generateMipmap(gl.TEXTURE_2D);
    };
		
    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir + "shaders/";

    for (let i = 0; i < 3; i++) {
    	if (!cubeWorldMatrices[i]) {
    		cubeWorldMatrices[i] = [];
    	}
    	for (let j = 0; j < 3; j++) {
	    	if (!cubeWorldMatrices[i][j]) {
	    		cubeWorldMatrices[i][j] = [];
	    	}
    		for (let k = 0; k < 3; k++) {
    			if (!cubeWorldMatrices[i][j][k]) {
		    		cubeWorldMatrices[i][j][k] = [];
		    	}
    			if (i === 1 && j === 1 && k === 1) {
					cubeWorldMatrices[i][j][k] = "none";
    			} else {
					var worldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.7);
					cubeWorldMatrices[i][j][k] = worldMatrix;
    			}
    		}
    	}
	}
    await utils.loadFiles([shaderDir + "vs.glsl", shaderDir + "fs.glsl"], function (shaderText) {
		var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
		var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
		program = utils.createProgram(gl, vertexShader, fragmentShader);
	});

    /*
	00 - 01 - 02 -> column "right"
	10 - 11 - 12 -> column "in the middle"
	20 - 21 - 22 -> column "left"
	*/
    models[0] = await importObject("Cube00_B"); //green face, bottom right
    models[1] = await importObject("Cube00_M"); //green face, medium right
    models[2] = await importObject("Cube00"); //green face, top right
    models[3] = await importObject("Cube01_B"); //yellow face, bottom center
    models[4] = await importObject("Cube01_M"); //yellow face, medium center
    models[5] = await importObject("Cube01"); //yellow face, top center
    models[6] = await importObject("Cube02_B"); //yellow face, bottom right
    models[7] = await importObject("Cube02_M"); //yellow face, medium right
    models[8] = await importObject("Cube02"); //yellow face, top right
    models[9] = await importObject("Cube10_B"); //green face, bottom center 
    models[10] = await importObject("Cube10_M"); //green face, medium center
    models[11] = await importObject("Cube10"); //green face, top medium
    models[12] = await importObject("Cube11_B"); //blue face, bottom center
    models[13] = await importObject("Cube11"); //white face, medium center
    models[14] = await importObject("Cube12_B"); //blue face, bottom center
    models[15] = await importObject("Cube12_M"); //orange face, medium center
    models[16] = await importObject("Cube12"); //white face, top center
    models[17] = await importObject("Cube20_B"); //green face, bottom left
    models[18] = await importObject("Cube20_M"); //green face, medium left
    models[19] = await importObject("Cube20"); //green face, top left
    models[20] = await importObject("Cube21_B"); //blue face, medium left
    models[21] = await importObject("Cube21_M"); //red face, medium center
    models[22] = await importObject("Cube21"); //white face, medium left 
    models[23] = await importObject("Cube22_B"); //blue face, bottom left
    models[24] = await importObject("Cube22_M"); //red face, medium left
    models[25] = await importObject("Cube22"); //white face, top left

    main();
}

window.onload = init;

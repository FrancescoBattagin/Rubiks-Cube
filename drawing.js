var program;
var gl;
var baseDir;
var shaderDir;
var image;

var models = new Array();

var vaos = new Array();

var positionAttributeLocation;

var normalsAttributeLocation;

var uvLocation;

var textureFileHandle;

var texture;

var Tx = 0.0;
var Ty = 0.0;
var Tz = 0.0;
var Rx = 0.0;
var Ry = 0.0;
var Rz = 0.0;
var S  = 0.7;

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
	//normalsAttributeLocation = gl.getAttribLocation(program, "a_normal");
	textureFileHandle= gl.getUniformLocation(program, "a_texture");
	
	for(let i = 0; i < 26; i++){
		vaos[i]=gl.createVertexArray();
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

//fare 26 programmi per fare le animazioni
function drawScene() {
	
	animate();
	
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
	gl.useProgram(program);
	
	var worldMatrix = utils.MakeWorld(Tx, Ty, Tz, Rx, Ry, Rz, S);
	var perspectiveMatrix = utils.MakePerspective(30, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
	
	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	
	var viewMatrix = utils.MakeView(cx, cy, cz, elevation,angle);

	var matrixLocation = gl.getUniformLocation(program, "matrix");
	var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
	var worldMatrixLocation = gl.getUniformLocation(program, 'worldMatrix');
	
	var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatrix));

	var viewWorldMatrix = utils.multiplyMatrices(viewMatrix,worldMatrix);
	var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
	
	gl.uniformMatrix4fv(matrixLocation , gl.FALSE, utils.transposeMatrix(projectionMatrix));
	gl.uniformMatrix4fv(normalMatrixPositionHandle , gl.FALSE, utils.transposeMatrix(normalMatrix));
	gl.uniformMatrix4fv(worldMatrixLocation , gl.FALSE, utils.transposeMatrix(worldMatrix));
	
	for(let i = 0; i < 26; i++){
		gl.bindVertexArray(vaos[i]);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(textureFileHandle, 0);
		
		gl.drawElements(gl.TRIANGLES, models[i].indices.length, gl.UNSIGNED_SHORT, 0);
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

    image=new Image();
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
    shaderDir = baseDir+"shaders/";

	await utils.loadFiles([shaderDir + "vs.glsl", shaderDir + "fs.glsl"], function (shaderText) {
		var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
		var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

		program = utils.createProgram(gl, vertexShader, fragmentShader);
	});

    models[0] = await importObject("Cube00_B");
    models[1] = await importObject("Cube00_M");
    models[2] = await importObject("Cube00");
    models[3] = await importObject("Cube01_B");
    models[4] = await importObject("Cube01_M");
    models[5] = await importObject("Cube01");
    models[6] = await importObject("Cube02_B");
    models[7] = await importObject("Cube02_M");
    models[8] = await importObject("Cube02");
    models[9] = await importObject("Cube10_B");
    models[10] = await importObject("Cube10_M");
    models[11] = await importObject("Cube10");
    models[12] = await importObject("Cube11_B");
    models[13] = await importObject("Cube11");
    models[14] = await importObject("Cube12_B");
    models[15] = await importObject("Cube12_M");
    models[16] = await importObject("Cube12");
    models[17] = await importObject("Cube20_B");
    models[18] = await importObject("Cube20_M");
    models[19] = await importObject("Cube20");
    models[20] = await importObject("Cube21_B");
    models[21] = await importObject("Cube21_M");
    models[22] = await importObject("Cube21");
    models[23] = await importObject("Cube22_B");
    models[24] = await importObject("Cube22_M");
    models[25] = await importObject("Cube22");

    main();
}

window.onload = init;

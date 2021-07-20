var gl;
var baseDir;
var shaderDir;
var image;

var cubes = ["Cube00_B", "Cube00_M", "Cube00", "Cube01_B", "Cube01_M", "Cube01", "Cube02_B", "Cube02_M", "Cube02", "Cube10_B", "Cube10_M", "Cube10", "Cube11_B", "Cube11", "Cube12_B", "Cube12_M", "Cube12", "Cube20_B", "Cube20_M", "Cube20", "Cube21_B", "Cube21_M", "Cube21", "Cube22_B", "Cube22_M", "Cube22"];

var models = new Array();
var vaos = new Array();

var program = new Array();
// 0 -> no lights
// 1 -> lambert refl directional light

var wmAndQList = new Array();
var wmRef = new Array(); //3d array: ref -> index of wmAndQList (and center colors)

var centerCoordinates = {};

var normalMatrixPositionHandle; //shaders nmatrix location
var worldMatrixLocation; //shaders wm location
var positionAttributeLocation = new Array(); //shaders position location (for each program)
var normalsAttributeLocation; //shaders normals location
var lightDirectionHandle; //shaders direction light location
var lightColorHandle; //shaders color light location

var lastUpdateTime = null;

var uvLocation = new Array(); //shaders uv location (for each program)
var texture;

var scale = 0.7; //world matrix
var cx = 4.5; //view matrix
var cy = 0.0; //view matrix
var cz = 10.0; //view matrix
var elevation = -15.0; //view matrix
var angle = 0.0; //view matrix

var dirLightAlpha = -utils.degToRad(220);
var dirLightBeta  = -utils.degToRad(100);

//directional light versor
var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
			  
var directionalLightColor = [2.0, 2.0, 2.0];

//for selected face color
var node;

function main() {
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
	
	vaos[0] = [];
	vaos[1] = [];
	
	normalMatrixPositionHandle = gl.getUniformLocation(program[1], 'nMatrix');
	worldMatrixLocation = gl.getUniformLocation(program[1], 'worldMatrix');
	lightDirectionHandle = gl.getUniformLocation(program[1], 'lightDirection');
	lightColorHandle = gl.getUniformLocation(program[1], 'lightColor');
	
	positionAttributeLocation[0] = gl.getAttribLocation(program[0], "a_position");
	positionAttributeLocation[1] = gl.getAttribLocation(program[1], "a_position");
	uvLocation[0] = gl.getAttribLocation(program[0], "a_uv");
	uvLocation[1] = gl.getAttribLocation(program[1], "a_uv");
	normalsAttributeLocation = gl.getAttribLocation(program[1], "a_normal");
	
	for(let j=0; j<2;j++){
		for(let i = 0; i < 26; i++){
			vaos[j][i] = gl.createVertexArray();
			gl.bindVertexArray(vaos[j][i]);

			//vertices
			var positionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].vertices), gl.STATIC_DRAW);
			gl.enableVertexAttribArray(positionAttributeLocation[j]);
			gl.vertexAttribPointer(positionAttributeLocation[j], 3, gl.FLOAT, false, 0, 0);
			
			//normals
			if(j==1){
				var normalsBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].vertexNormals), gl.STATIC_DRAW);
				gl.enableVertexAttribArray(normalsAttributeLocation);
				gl.vertexAttribPointer(normalsAttributeLocation, 3, gl.FLOAT, false, 0, 0);
			}

			//indices
			var indexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(models[i].indices), gl.STATIC_DRAW);

			//uv
			var uvBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].textures), gl.STATIC_DRAW);
			gl.vertexAttribPointer(uvLocation[j], 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(uvLocation[j]);
		}
	}
	drawScene();
}

function animate(){
	var currentTime = (new Date).getTime();
    if(lastUpdateTime){
		var deltaC = (100 * (currentTime - lastUpdateTime)) / 1000.0;
		if(degToAnimate > 0){
			if(countAnimate + deltaC <= 90){
				if(countAnimate + deltaC === 90){
					last = true;
				}
				functionToAnimate(deltaC);
				if(last){
					last = false;
					lastUpdateTime = null;
					degToAnimate = 0;
					countAnimate = 0;
				} else {
					lastUpdateTime = currentTime;
					countAnimate += deltaC;					
				}
			} else{
				last = true;
				functionToAnimate(90 - countAnimate);
				last = false;
				lastUpdateTime = null;
				functionToAnimate = null;
				degToAnimate = 0;
				countAnimate = 0;
			}
		} else{
			if(countAnimate + deltaC <= 90){
				if(countAnimate + deltaC === 90){
					last = true;
				}
				functionToAnimate(-deltaC);
				if(last){
					last = false;
					lastUpdateTime = null;
					degToAnimate = 0;
					countAnimate = 0;
				} else {
					lastUpdateTime = currentTime;
					countAnimate += deltaC;
				}
			} else{
				last = true;
				functionToAnimate(-90 + countAnimate);
				last = false;
				lastUpdateTime = null;
				functionToAnimate = null;
				degToAnimate = 0;
				countAnimate = 0;
			}
		}
    }
}

function drawScene() {
	
	if (functionToAnimate !== null) {
		animate();
	}
	
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
										
	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	
	directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
          Math.sin(dirLightAlpha),
          Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
          ];
	
	gl.useProgram(program[selectedLight]);
	var matrixLocation = gl.getUniformLocation(program[selectedLight], "matrix");

	for (let i = 0; i < 26; i++) {
		//how to see objects
		var perspectiveMatrix = utils.MakePerspective(30, gl.canvas.width/gl.canvas.height, 0.1, 100.0);

		//camera
		var viewMatrix = utils.MakeView(cx, cy, cz, elevation,angle);

		var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, wmAndQList[i].matrix);
		
		//final matrix
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
		gl.uniformMatrix4fv(matrixLocation , 0, utils.transposeMatrix(projectionMatrix));

		if(selectedLight===1){
			
			//var normalMatrix = utils.invertMatrix(utils.transposeMatrix(wmAndQList[i].matrix));

			var lightDirMatrix = utils.transposeMatrix(wmAndQList[i].matrix); 
			var lightdirTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(lightDirMatrix), directionalLight); 
			
			gl.uniform3fv(lightColorHandle,  directionalLightColor);
			gl.uniform3fv(lightDirectionHandle,  lightdirTransformed);
			gl.uniformMatrix4fv(normalMatrixPositionHandle , gl.FALSE, utils.transposeMatrix(wmAndQList[i].matrix)); //nMatrix	
			gl.uniformMatrix4fv(worldMatrixLocation , gl.FALSE, utils.transposeMatrix(wmAndQList[i].matrix)); //worldMatrix
		}		
		
		gl.bindVertexArray(vaos[selectedLight][i]);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
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
	document.addEventListener('keydown', keyFunctionDown);
	document.addEventListener('keyup', keyFunctionUp);


    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
	
    utils.resizeCanvasToDisplaySize(gl.canvas);

	node = document.getElementById('face');
    newNode = document.createElement('p');
	newNode.appendChild(document.createTextNode(''));
	node.appendChild(newNode);

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

    /*
	cubeWorldMatrices[i][j][k]
	i-> RIGHT=0 CENTER=1 LEFT=2
	j-> FRONT=0 BETWEEN=1 BACK=2
	k-> BOTTOM=0 MEDIUM=1 TOP=2
	*/
    for (let i = 0, count = 0; i < 3; i++) {
    	if (!wmRef[i]) {
    		wmRef[i] = [];
    	}
    	for (let j = 0; j < 3; j++) {
	    	if (!wmRef[i][j]) {
	    		wmRef[i][j] = [];
	    	}
    		for (let k = 0; k < 3; k++) {
    			if (!wmRef[i][j][k]) {
		    		wmRef[i][j][k] = [];
		    	}
    			if (i === 1 && j === 1 && k === 1) {
					wmRef[i][j][k] = "none";
    			} else {
					var worldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, scale);
					var q = new Quaternion();
					wmAndQList[count] = {
						matrix: worldMatrix,
						quaternion: q
					};
					wmRef[i][j][k] = {
						index: count,
						color: ""
					};
					count++;
    			}
    		}
    	}
	}

	centerCoordinates.white = {
		i: 1,
		j: 1,
		k: 2
	};
	wmRef[1][1][2].color = "white"; 
	centerCoordinates.yellow = {
		i: 1,
		j: 1,
		k: 0
	};
	wmRef[1][1][0].color = "yellow";
	centerCoordinates.blue = {
		i: 1,
		j: 2,
		k: 1
	};
	wmRef[1][2][1].color = "blue";
	centerCoordinates.green = {
		i: 1,
		j: 0,
		k: 1
	};
	wmRef[1][0][1].color = "green";
	centerCoordinates.red = {
		i: 0,
		j: 1,
		k: 1
	};
	wmRef[0][1][1].color = "red";
	centerCoordinates.orange = {
		i: 2,
		j: 1,
		k: 1
	};
	wmRef[2][1][1].color = "orange";

    await utils.loadFiles([shaderDir + "vs.glsl", shaderDir + "fs.glsl"], function (shaderText) {
		var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
		var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
		program[0] = utils.createProgram(gl, vertexShader, fragmentShader);
	});
	
	await utils.loadFiles([shaderDir + "vsL.glsl", shaderDir + "fsL.glsl"], function (shaderText) {
		var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
		var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
		program[1] = utils.createProgram(gl, vertexShader, fragmentShader);
	});
	    
	for (let c in cubes) {
        models[c] = await importObject(cubes[c]);
    }
    main();
}

window.onload = init;
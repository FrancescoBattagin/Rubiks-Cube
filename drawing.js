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
var wmRef = new Array();

var centerCoordinates = {};

var positionAttributeLocation = new Array();
var normalsAttributeLocation = new Array();
var lightDirectionHandle = new Array();
var lightColorHandle = new Array();

var lastUpdateTime = null;

var uvLocation = new Array();
var textureFileHandle = new Array();
var texture;

var scale = 0.7;

var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
var elevation = -15.0;
var angle = 0.0;

var dirLightAlpha = -utils.degToRad(220);
var dirLightBeta  = -utils.degToRad(100);

 var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
			  
var directionalLightColor = [2.0, 2.0, 2.0];

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
	
	for(let j = 0; j < 2; j++){
		
		positionAttributeLocation[j] = gl.getAttribLocation(program[j], "a_position");
		uvLocation[j] = gl.getAttribLocation(program[j], "a_uv");
		normalsAttributeLocation[j] = gl.getAttribLocation(program[j], "a_normal");
		textureFileHandle[j] = gl.getUniformLocation(program[j], "a_texture");
		lightDirectionHandle[j] = gl.getUniformLocation(program[j], 'lightDirection');
		lightColorHandle[j] = gl.getUniformLocation(program[j], 'lightColor');
		
		for(let i = 0; i < 26; i++){
			vaos[j][i] = gl.createVertexArray();
			gl.bindVertexArray(vaos[j][i]);

			var positionBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].vertices), gl.STATIC_DRAW);

			gl.enableVertexAttribArray(positionAttributeLocation[j]);
			gl.vertexAttribPointer(positionAttributeLocation[j], 3, gl.FLOAT, false, 0, 0);

			var normalsBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].vertexNormals), gl.STATIC_DRAW);
			gl.enableVertexAttribArray(normalsAttributeLocation[j]);
			gl.vertexAttribPointer(normalsAttributeLocation[j], 3, gl.FLOAT, false, 0, 0);

			var indexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(models[i].indices), gl.STATIC_DRAW);

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

	for (let i = 0; i < 26; i++) {
		gl.useProgram(program[selectedLight]);
	
		var perspectiveMatrix = utils.MakePerspective(30, gl.canvas.width/gl.canvas.height, 0.1, 100.0);

		//TODO: devi trovare il modo di indirizzare la luce nella direzione in cui noi stiamo guardando
		
		var viewMatrix = utils.MakeView(cx, cy, cz, elevation,angle);

		var matrixLocation = gl.getUniformLocation(program[selectedLight], "matrix");
		var normalMatrixPositionHandle = gl.getUniformLocation(program[selectedLight], 'nMatrix');
		var worldMatrixLocation = gl.getUniformLocation(program[selectedLight], 'worldMatrix');
		
		var normalMatrix = utils.invertMatrix(utils.transposeMatrix(wmAndQList[i].matrix));

		var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, wmAndQList[i].matrix);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
		
		var lightDirMatrix = utils.transposeMatrix(wmAndQList[i].matrix); 
		var lightdirTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(lightDirMatrix), directionalLight); 
		
		gl.uniform3fv(lightColorHandle[selectedLight],  directionalLightColor);
		gl.uniform3fv(lightDirectionHandle[selectedLight],  lightdirTransformed);
		
		gl.uniformMatrix4fv(matrixLocation , gl.FALSE, utils.transposeMatrix(projectionMatrix));
		gl.uniformMatrix4fv(normalMatrixPositionHandle , gl.FALSE, utils.transposeMatrix(normalMatrix));
		gl.uniformMatrix4fv(worldMatrixLocation , gl.FALSE, utils.transposeMatrix(wmAndQList[i].matrix));
		//mettere qui ligfht dir color
		
		
		gl.bindVertexArray(vaos[selectedLight][i]);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(textureFileHandle[selectedLight], 0);
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
		i: 0,
		j: 1,
		k: 1
	};
	wmRef[0][1][1].color = "yellow";
	centerCoordinates.blue = {
		i: 1,
		j: 1,
		k: 0
	};
	wmRef[1][1][0].color = "blue";
	centerCoordinates.green = {
		i: 1,
		j: 0,
		k: 1
	};
	wmRef[1][0][1].color = "green";
	centerCoordinates.red = {
		i: 2,
		j: 1,
		k: 1
	};
	wmRef[2][1][1].color = "red";
	centerCoordinates.orange = {
		i: 1,
		j: 2,
		k: 1
	};
	wmRef[1][2][1].color = "orange";

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
	
	/*
	cubeWorldMatrices[i][j][k]
	
	i-> RIGHT=0 CENTER=1 LEFT=2
	j-> FRONT=0 BETWEEN=1 BACK=2
	k-> BOTTOM=0 MEDIUM=1 TOP=2
	*/
    
	for (let c in cubes) {
        models[c] = await importObject(cubes[c]);
    }
	
    main();
}

window.onload = init;
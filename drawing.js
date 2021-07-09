var gl;
var baseDir;
var shaderDir;
var image;

var cubes = ["Cube00_B", "Cube00_M", "Cube00", "Cube01_B", "Cube01_M", "Cube01", "Cube02_B", "Cube02_M", "Cube02", "Cube10_B", "Cube10_M", "Cube10", "Cube11_B", "Cube11", "Cube12_B", "Cube12_M", "Cube12", "Cube20_B", "Cube20_M", "Cube20", "Cube21_B", "Cube21_M", "Cube21", "Cube22_B", "Cube22_M", "Cube22"];

var models = new Array();
var vaos = new Array();

var program;

var worldMatricesList =  new Array();
var worldMatricesRef =  new Array();

var centerCoordinates = {};

var positionAttributeLocation;
var normalsAttributeLocation;

var uvLocation;
var textureFileHandle;
var texture;

var selectedFace = null;

var shift;

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
			console.log("KeyDown - White");
			selectedFace = centerCoordinates.white;
			break;
	  	case 89:
			console.log("KeyDown - Yellow");
			selectedFace = centerCoordinates.yellow;
			break;
	  	case 66:
			console.log("KeyDown - Blue");
			selectedFace = centerCoordinates.blue;
			break;
	  	case 71:
			console.log("KeyDown - Green");
			selectedFace = centerCoordinates.green;
			break;
	  	case 82:
			console.log("KeyDown - Red");
			selectedFace = centerCoordinates.red;
			break;
	  	case 79:
			console.log("KeyDown - Orange");
			selectedFace = centerCoordinates.orange;
			break;
		case 39:
			console.log("KeyDown - Right");
			if(shift)
				rotateMiddle("R");
			else
				rotateFace("R");
			break;
	  	case 37:
			console.log("KeyDown - Left");
			if(shift)
				rotateMiddle("L");
			else
				rotateFace("L");
			break;	
		case 38:
			console.log("KeyDown - Up");
			if(shift)
				rotateMiddle("U");
			break;
		case 40:
			console.log("KeyDown - Down");
			if(shift)
				rotateMiddle("D");
			break;
		case 16:
			console.log("KeyDown - Shift");
			shift = true;
			break;
	}
}

var keyFunctionUp = function(e) {
	if(e.keyCode === 16){
		console.log("KeyUp - Shift")
		shift = false;
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
    gl.enable(gl.CULL_FACE);
		
	positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	uvLocation = gl.getAttribLocation(program, "a_uv");
	normalsAttributeLocation = gl.getAttribLocation(program, "a_normal");
	textureFileHandle = gl.getUniformLocation(program, "a_texture");
	
	for(let i = 0; i < 26; i++){
		vaos[i] = gl.createVertexArray();
		gl.bindVertexArray(vaos[i]);

		var positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].vertices), gl.STATIC_DRAW);

		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

		var normalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].normals), gl.STATIC_DRAW);
		//console.log(models[i].indices);
		gl.enableVertexAttribArray(normalsAttributeLocation);
		gl.vertexAttribPointer(normalsAttributeLocation, 3, gl.FLOAT, false, 0, 0);

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

function rotateFace(rotation){
	if (selectedFace.i === 0) {
		switch(rotation) {
			case "R":
				clockwiseRightFace();
				break;
			case "L":
				counterClockwiseRightFace();
		}
	} else if (selectedFace.i === 2) {
		switch(rotation) {
			case "R":
				clockwiseLeftFace();
				break;
			case "L":
				counterClockwiseLeftFace();
		}
	} else {
		if (selectedFace.j === 0) {
			switch(rotation) {
				case "R":
					clockwiseFrontFace();
					break;
				case "L":
					counterClockwiseFrontFace();
			}
		} else if (selectedFace.j === 2) {
			switch(rotation) {
				case "R":
					clockwiseBackFace();
					break;
				case "L":
					counterClockwiseBackFace();
			}
		} else {
			if (selectedFace.k === 0) {
				switch(rotation) {
					case "R":
						clockwiseDownFace();
						break;
					case "L":
						counterClockwiseDownFace();
				}
			} else if (selectedFace.k === 2) {
				switch(rotation) {
					case "R":
						clockwiseUpFace();
						break;
					case "L":
						counterClockwiseUpFace();
				}
			}
		}
	}
}

function clockwiseRightFace() {
	rotateRightFace(-90);

	let temp000, temp001, temp002, temp010, temp012, temp020, temp021, temp022;
	temp000 = worldMatricesRef[0][0][0];
	temp001 = worldMatricesRef[0][0][1];
	temp002 = worldMatricesRef[0][0][2];
	temp010 = worldMatricesRef[0][1][0];
	temp012 = worldMatricesRef[0][1][2];
	temp020 = worldMatricesRef[0][2][0];
	temp021 = worldMatricesRef[0][2][1];
	temp022 = worldMatricesRef[0][2][2];

	// not working
	/*worldMatricesRef[0][0][0] = temp020;
	worldMatricesRef[0][0][1] = temp010;
	worldMatricesRef[0][0][2] = temp000;
	worldMatricesRef[0][1][0] = temp021;
	worldMatricesRef[0][1][2] = temp001;
	worldMatricesRef[0][2][0] = temp022;
	worldMatricesRef[0][2][1] = temp012;
	worldMatricesRef[0][2][2] = temp002;*/
}

function counterClockwiseRightFace() {
	rotateRightFace(90);

	let temp000, temp001, temp002, temp010, temp012, temp020, temp021, temp022;
	temp000 = worldMatricesRef[0][0][0];
	temp001 = worldMatricesRef[0][0][1];
	temp002 = worldMatricesRef[0][0][2];
	temp010 = worldMatricesRef[0][1][0];
	temp012 = worldMatricesRef[0][1][2];
	temp020 = worldMatricesRef[0][2][0];
	temp021 = worldMatricesRef[0][2][1];
	temp022 = worldMatricesRef[0][2][2];

	// reassign worldMatricesRef related to moved cubes
}

function rotateRightFace(deg) {
	worldMatricesList[worldMatricesRef[0][0][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][0][0]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[0][0][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][0][1]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[0][0][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][0][2]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[0][1][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][1][0]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[0][1][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][1][2]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[0][2][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][2][0]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[0][2][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][2][1]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[0][2][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][2][2]], utils.MakeRotateXMatrix(deg));
}

function clockwiseLeftFace() {
	rotateLeftFace(90);

	let temp000, temp001, temp002, temp010, temp012, temp020, temp021, temp022;
	temp000 = worldMatricesRef[2][0][0];
	temp001 = worldMatricesRef[2][0][1];
	temp002 = worldMatricesRef[2][0][2];
	temp010 = worldMatricesRef[2][1][0];
	temp012 = worldMatricesRef[2][1][2];
	temp020 = worldMatricesRef[2][2][0];
	temp021 = worldMatricesRef[2][2][1];
	temp022 = worldMatricesRef[2][2][2];

	// reassign worldMatricesRef related to moved cubes
}

function counterClockwiseLeftFace() {
	rotateLeftFace(-90);

	let temp000, temp001, temp002, temp010, temp012, temp020, temp021, temp022;
	temp000 = worldMatricesRef[2][0][0];
	temp001 = worldMatricesRef[2][0][1];
	temp002 = worldMatricesRef[2][0][2];
	temp010 = worldMatricesRef[2][1][0];
	temp012 = worldMatricesRef[2][1][2];
	temp020 = worldMatricesRef[2][2][0];
	temp021 = worldMatricesRef[2][2][1];
	temp022 = worldMatricesRef[2][2][2];

	// reassign worldMatricesRef related to moved cubes
}

function rotateLeftFace(deg) {
	worldMatricesList[worldMatricesRef[2][0][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][0][0]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[2][0][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][0][1]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[2][0][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][0][2]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[2][1][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][1][0]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[2][1][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][1][2]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[2][2][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][2][0]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[2][2][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][2][1]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[2][2][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][2][2]], utils.MakeRotateXMatrix(deg));
}

function clockwiseFrontFace() {
	rotateFrontFace(90);

	let temp000, temp001, temp002, temp010, temp012, temp020, temp021, temp022;
	temp000 = worldMatricesRef[0][0][0];
	temp001 = worldMatricesRef[0][0][1];
	temp002 = worldMatricesRef[0][0][2];
	temp100 = worldMatricesRef[1][0][0];
	temp102 = worldMatricesRef[1][0][2];
	temp200 = worldMatricesRef[2][0][0];
	temp201 = worldMatricesRef[2][0][1];
	temp202 = worldMatricesRef[2][0][2];

	// reassign worldMatricesRef related to moved cubes
}

function counterClockwiseFrontFace() {
	rotateFrontFace(-90);

	let temp000, temp001, temp002, temp010, temp012, temp020, temp021, temp022;
	temp000 = worldMatricesRef[0][0][0];
	temp001 = worldMatricesRef[0][0][1];
	temp002 = worldMatricesRef[0][0][2];
	temp100 = worldMatricesRef[1][0][0];
	temp102 = worldMatricesRef[1][0][2];
	temp200 = worldMatricesRef[2][0][0];
	temp201 = worldMatricesRef[2][0][1];
	temp202 = worldMatricesRef[2][0][2];

	// reassign worldMatricesRef related to moved cubes
}

function rotateFrontFace(deg) {
	worldMatricesList[worldMatricesRef[0][0][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][0][0]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[0][0][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][0][1]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[0][0][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][0][2]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[1][0][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][0][0]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[1][0][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][0][2]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[2][0][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][0][0]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[2][0][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][0][1]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[2][0][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][0][2]], utils.MakeRotateZMatrix(deg));
}

function clockwiseBackFace() {
	rotateBackFace(-90);

	let temp000, temp001, temp002, temp010, temp012, temp020, temp021, temp022;
	temp000 = worldMatricesRef[0][2][0];
	temp001 = worldMatricesRef[0][2][1];
	temp002 = worldMatricesRef[0][2][2];
	temp100 = worldMatricesRef[1][2][0];
	temp102 = worldMatricesRef[1][2][2];
	temp200 = worldMatricesRef[2][2][0];
	temp201 = worldMatricesRef[2][2][1];
	temp202 = worldMatricesRef[2][2][2];

	// reassign worldMatricesRef related to moved cubes
}

function counterClockwiseBackFace() {
	rotateBackFace(90);

	let temp000, temp001, temp002, temp010, temp012, temp020, temp021, temp022;
	temp000 = worldMatricesRef[0][2][0];
	temp001 = worldMatricesRef[0][2][1];
	temp002 = worldMatricesRef[0][2][2];
	temp100 = worldMatricesRef[1][2][0];
	temp102 = worldMatricesRef[1][2][2];
	temp200 = worldMatricesRef[2][2][0];
	temp201 = worldMatricesRef[2][2][1];
	temp202 = worldMatricesRef[2][2][2];

	// reassign worldMatricesRef related to moved cubes
}

function rotateBackFace(deg) {
	worldMatricesList[worldMatricesRef[0][2][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][2][0]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[0][2][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][2][1]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[0][2][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][2][2]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[1][2][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][2][0]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[1][2][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][2][2]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[2][2][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][2][0]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[2][2][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][2][1]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[2][2][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][2][2]], utils.MakeRotateZMatrix(deg));
}

function clockwiseDownFace() {
	rotateDownFace(-90);

	// reassign worldMatricesRef related to moved cubes
}

function counterClockwiseDownFace() {
	rotateDownFace(90);

	// reassign worldMatricesRef related to moved cubes
}

function rotateDownFace(deg) {
	worldMatricesList[worldMatricesRef[0][0][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][0][0]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[0][1][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][1][0]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[0][2][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][2][0]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[1][0][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][0][0]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[1][2][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][2][0]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[2][0][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][0][0]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[2][1][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][1][0]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[2][2][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][2][0]], utils.MakeRotateYMatrix(deg));
}

function clockwiseUpFace() {
	rotateUpFace(90);

	// reassign worldMatricesRef related to moved cubes
}

function counterClockwiseUpFace() {
	rotateUpFace(-90);

	// reassign worldMatricesRef related to moved cubes
}

function rotateUpFace(deg) {
	worldMatricesList[worldMatricesRef[0][0][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][0][2]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[0][1][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][1][2]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[0][2][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][2][2]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[1][0][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][0][2]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[1][2][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][2][2]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[2][0][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][0][2]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[2][1][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][1][2]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[2][2][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][2][2]], utils.MakeRotateYMatrix(deg));
}

function rotateMiddle(rotation){
	// the rotation must reassign centerCoordinates of each color center involved in the rotation
	if (selectedFace.i === 0) {
		switch(rotation) {
			case "R":
				rightMiddleHorizontal();
				break;
			case "L":
				leftMiddleHorizontal();
				break;
			case "U":
				upMiddleVerticalRight();
				break;
			case "D":
				downMiddleVerticalRight();
		}
	} else if (selectedFace.i === 2) {
		switch(rotation) {
			case "R":
				rightMiddleHorizontal();
				break;
			case "L":
				leftMiddleHorizontal();
				break;
			case "U":
				upMiddleVerticalLeft();
				break;
			case "D":
				downMiddleVerticalLeft();
				break;
		}
	} else {
		if (selectedFace.j === 0) {
			switch(rotation) {
				case "R":
					rightMiddleHorizontal();
					break;
				case "L":
					leftMiddleHorizontal();
					break;
				case "U":
					upMiddleVerticalFront();
					break;
				case "D":
					downMiddleVerticalFront();
					break;
			}
		} else if (selectedFace.j === 2) {
			switch(rotation) {
				case "R":
					rightMiddleHorizontal();
					break;
				case "L":
					leftMiddleHorizontal();
					break;
				case "U":
					upMiddleVerticalBack();
					break;
				case "D":
					downMiddleVerticalBack();
					break;
			}
		} else {
			if (selectedFace.k === 0) {
				switch(rotation) {
					case "R":
						
						break;
					case "L":
						
						break;
					case "U":
						upMiddleVerticalTop();
						break;
					case "D":
						downMiddleHorizontalTop();
						break;
				}
			} else if (selectedFace.k === 2) {
				switch(rotation) {
					case "R":
						
						break;
					case "L":
						
						break;
					case "U":
						upMiddleVerticalBottom();
						break;
					case "D":
						downMiddleHorizontalBottom();
						break;
				}
			}
		}
	}
}

function rightMiddleHorizontal() {
	rotateMiddleHorizontal(-90);
}

function leftMiddleHorizontal() {
	rotateMiddleHorizontal(90);
}

// all cubes with k = 1
function rotateMiddleHorizontal(deg) {
	worldMatricesList[worldMatricesRef[0][0][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][0][1]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[0][1][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][1][1]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[0][2][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][2][1]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[1][0][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][0][1]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[1][2][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][2][1]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[2][0][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][0][1]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[2][1][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][1][1]], utils.MakeRotateYMatrix(deg));
	worldMatricesList[worldMatricesRef[2][2][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][2][1]], utils.MakeRotateYMatrix(deg));
}

function upMiddleVerticalFront() {
	rotateMiddleVerticalFrontBack(-90);
}

function downMiddleVerticalFront() {
	rotateMiddleVerticalFrontBack(90);	
}

function upMiddleVerticalBack() {
	rotateMiddleVerticalFrontBack(90);
}

function downMiddleVerticalBack() {
	rotateMiddleVerticalFrontBack(-90);	
}

function rotateMiddleVerticalFrontBack(deg) {
	worldMatricesList[worldMatricesRef[1][0][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][0][0]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[1][0][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][0][1]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[1][0][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][0][2]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[1][1][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][1][0]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[1][1][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][1][2]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[1][2][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][2][0]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[1][2][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][2][1]], utils.MakeRotateXMatrix(deg));
	worldMatricesList[worldMatricesRef[1][2][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][2][2]], utils.MakeRotateXMatrix(deg));
}

function upMiddleVerticalRight() {
	rotateMiddleVerticalRightLeft(-90);
}

function downMiddleVerticalRight() {
	rotateMiddleVerticalRightLeft(90)
}

function upMiddleVerticalLeft() {
	rotateMiddleVerticalRightLeft(90);
}

function downMiddleVerticalLeft() {
	rotateMiddleVerticalRightLeft(90);
}

function rotateMiddleVerticalRightLeft(deg) {
	worldMatricesList[worldMatricesRef[0][1][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][1][0]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[0][1][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][1][1]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[0][1][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[0][1][2]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[1][1][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][1][0]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[1][1][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[1][1][2]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[2][1][0]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][1][0]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[2][1][1]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][1][1]], utils.MakeRotateZMatrix(deg));
	worldMatricesList[worldMatricesRef[2][1][2]] = utils.multiplyMatrices(worldMatricesList[worldMatricesRef[2][1][2]], utils.MakeRotateZMatrix(deg));
}

function upMiddleVerticalTop() {
	rotateMiddleVerticalFrontBack(-90);
}

function downMiddleHorizontalTop() {
	rotateMiddleVerticalFrontBack(90);
}

function upMiddleVerticalBottom() {
	rotateMiddleVerticalFrontBack(-90);
}

function downMiddleHorizontalBottom() {
	rotateMiddleVerticalFrontBack(90);
}

function animate(){
	/*interpolation*/
}


function drawScene() {
	
	animate();
	
	gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	/*let count = 0;
	for(let i = 0; i < 3; i++)
		for (let j = 0; j < 3; j++)
			for (let k = 0; k < 3; k++) {
				if (!(i === 1 && j === 1 && k === 1)) {*/
					//console.log(count);
	for (let i = 0; i < 26; i++) {
		gl.useProgram(program);
	
		var perspectiveMatrix = utils.MakePerspective(30, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
		
		cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
		cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
		cy = lookRadius * Math.sin(utils.degToRad(-elevation));
		
		var viewMatrix = utils.MakeView(cx, cy, cz, elevation,angle);

		var matrixLocation = gl.getUniformLocation(program, "matrix");
		var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
		var worldMatrixLocation = gl.getUniformLocation(program, 'worldMatrix');
		
		var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatricesList[i]));

		var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatricesList[i]);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
		
		gl.uniformMatrix4fv(matrixLocation , gl.FALSE, utils.transposeMatrix(projectionMatrix));
		gl.uniformMatrix4fv(normalMatrixPositionHandle , gl.FALSE, utils.transposeMatrix(normalMatrix));
		gl.uniformMatrix4fv(worldMatrixLocation , gl.FALSE, utils.transposeMatrix(worldMatricesList[i]));

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
	document.addEventListener('keydown', keyFunctionDown);
	document.addEventListener('keyup', keyFunctionUp);


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

    for (let i = 0, count = 0; i < 3; i++) {
    	if (!worldMatricesRef[i]) {
    		worldMatricesRef[i] = [];
    	}
    	for (let j = 0; j < 3; j++) {
	    	if (!worldMatricesRef[i][j]) {
	    		worldMatricesRef[i][j] = [];
	    	}
    		for (let k = 0; k < 3; k++) {
    			if (!worldMatricesRef[i][j][k]) {
		    		worldMatricesRef[i][j][k] = [];
		    	}
    			if (i === 1 && j === 1 && k === 1) {
					worldMatricesRef[i][j][k] = "none";
    			} else {
					var worldMatrix = utils.MakeWorld(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.7);
					worldMatricesList[count] = worldMatrix;
					worldMatricesRef[i][j][k] = count;
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
	centerCoordinates.yellow = {
		i: 0,
		j: 1,
		k: 1
	};
	centerCoordinates.blue = {
		i: 1,
		j: 1,
		k: 0
	};
	centerCoordinates.green = {
		i: 1,
		j: 0,
		k: 1
	};
	centerCoordinates.red = {
		i: 2,
		j: 1,
		k: 1
	};
	centerCoordinates.orange = {
		i: 1,
		j: 2,
		k: 1
	};

    await utils.loadFiles([shaderDir + "vs.glsl", shaderDir + "fs.glsl"], function (shaderText) {
		var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
		var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
		program = utils.createProgram(gl, vertexShader, fragmentShader);
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
	
	
	/*
	00 - 01 - 02 -> column "right"
	10 - 11 - 12 -> column "in the middle"
	20 - 21 - 22 -> column "left"

    Cube00_B --> green face, bottom right
    Cube00_M --> green face, medium right
    Cube00 --> green face, top right
    Cube01_B --> yellow face, bottom center
    Cube01_M --> yellow face, medium center
    Cube01 --> yellow face, top center
    Cube02_B --> yellow face, bottom right
    Cube02_M --> yellow face, medium right
    Cube02 --> yellow face, top right
    Cube10_B --> green face, bottom center 
    Cube10_M --> green face, medium center
    Cube10 --> green face, top medium
    Cube11_B --> blue face, bottom center
    Cube11 --> white face, medium center
    Cube12_B --> blue face, bottom center
    Cube12_M --> orange face, medium center
    Cube12 --> white face, top center
    Cube20_B --> green face, bottom left
    Cube20_M --> green face, medium left
    Cube20 --> green face, top left
    Cube21_B --> blue face, medium left
    Cube21_M --> red face, medium center
    Cube21 --> white face, medium left 
    Cube22_B --> blue face, bottom left
    Cube22_M --> red face, medium left
    Cube22 --> white face, top left*/

    main();
}

window.onload = init;

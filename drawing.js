var gl;
var baseDir;
var shaderDir;
var image;

var cubes = ["Cube00_B", "Cube00_M", "Cube00", "Cube01_B", "Cube01_M", "Cube01", "Cube02_B", "Cube02_M", "Cube02", "Cube10_B", "Cube10_M", "Cube10", "Cube11_B", "Cube11", "Cube12_B", "Cube12_M", "Cube12", "Cube20_B", "Cube20_M", "Cube20", "Cube21_B", "Cube21_M", "Cube21", "Cube22_B", "Cube22_M", "Cube22"];

var models = new Array();
var vaos = new Array();

var program;

var wmAndQList =  new Array();
var wmRef =  new Array();

var centerCoordinates = {};

var positionAttributeLocation;
var normalsAttributeLocation;
var lightDirectionHandle;
var lightColorHandle;


var uvLocation;
var textureFileHandle;
var texture;

var selectedFace = null;

var shift;

var scale = 0.7;

var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
var elevation = -15.0;
var angle = 0.0;

var lookRadius = 23.0;

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;

 var dirLightAlpha = -utils.degToRad(60);
 var dirLightBeta  = -utils.degToRad(120);

 var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
			  
var directionalLightColor = [2.0, 2.0, 2.0];

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
			var node = document.getElementById('face');
			var newNode = document.createElement('p');
			newNode.appendChild(document.createTextNode('some dynamic html'));
			node.appendChild(newNode);
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
	lightDirectionHandle = gl.getUniformLocation(program, 'lightDirection');
    lightColorHandle = gl.getUniformLocation(program, 'lightColor');
	
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
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].vertexNormals), gl.STATIC_DRAW);
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
				rightFace(-90);
				break;
			case "L":
				rightFace(90);
		}
	} else if (selectedFace.i === 2) {
		switch(rotation) {
			case "R":
				leftFace(90);
				break;
			case "L":
				leftFace(-90);
		}
	} else {
		if (selectedFace.j === 0) {
			switch(rotation) {
				case "R":
					frontFace(-90);
					break;
				case "L":
					frontFace(90);
			}
		} else if (selectedFace.j === 2) {
			switch(rotation) {
				case "R":
					backFace(90);
					break;
				case "L":
					backFace(-90);
			}
		} else {
			if (selectedFace.k === 0) {
				switch(rotation) {
					case "R":
						downFace(90);
						break;
					case "L":
						downFace(-90);
				}
			} else if (selectedFace.k === 2) {
				switch(rotation) {
					case "R":
						upFace(-90);
						break;
					case "L":
						upFace(90);
				}
			}
		}
	}
}

function rightFace(deg) {
	rotateRightFace(deg);
	let temp000, temp001, temp002, temp010, temp012, temp020, temp021, temp022;
	temp000 = wmRef[0][0][0].index;
	temp001 = wmRef[0][0][1].index;
	temp002 = wmRef[0][0][2].index;
	temp010 = wmRef[0][1][0].index;
	temp012 = wmRef[0][1][2].index;
	temp020 = wmRef[0][2][0].index;
	temp021 = wmRef[0][2][1].index;
	temp022 = wmRef[0][2][2].index;
			
	if(deg > 0){
		// counterclockwise
		wmRef[0][0][0].index = temp002;
		wmRef[0][0][1].index = temp012;
		wmRef[0][0][2].index = temp022;
		wmRef[0][1][0].index = temp001;
		wmRef[0][1][2].index = temp021;
		wmRef[0][2][0].index = temp000;
		wmRef[0][2][1].index = temp010;
		wmRef[0][2][2].index = temp020;
	} else{
		// clockwise
		wmRef[0][0][0].index = temp020;
		wmRef[0][0][1].index = temp010;
		wmRef[0][0][2].index = temp000;
		wmRef[0][1][0].index = temp021;
		wmRef[0][1][2].index = temp001;
		wmRef[0][2][0].index = temp022;
		wmRef[0][2][1].index = temp012;
		wmRef[0][2][2].index = temp002;
	}
}

function rotateRightFace(deg) {
	updateQuaternion(wmRef[0][0][0].index, deg, 0, 0);
	updateQuaternion(wmRef[0][0][1].index, deg, 0, 0);
	updateQuaternion(wmRef[0][0][2].index, deg, 0, 0);
	updateQuaternion(wmRef[0][1][0].index, deg, 0, 0);
	updateQuaternion(wmRef[0][1][2].index, deg, 0, 0);
	updateQuaternion(wmRef[0][2][0].index, deg, 0, 0);
	updateQuaternion(wmRef[0][2][1].index, deg, 0, 0);
	updateQuaternion(wmRef[0][2][2].index, deg, 0, 0);
}

function leftFace(deg) {
	rotateLeftFace(deg);
	let temp200, temp201, temp202, temp210, temp212, temp220, temp221, temp222;
	temp200 = wmRef[2][0][0].index;
	temp201 = wmRef[2][0][1].index;
	temp202 = wmRef[2][0][2].index;
	temp210 = wmRef[2][1][0].index;
	temp212 = wmRef[2][1][2].index;
	temp220 = wmRef[2][2][0].index;
	temp221 = wmRef[2][2][1].index;
	temp222 = wmRef[2][2][2].index;
	
	if (deg < 0) {
		wmRef[2][0][0].index = temp220;
		wmRef[2][0][1].index = temp210;
		wmRef[2][0][2].index = temp200;
		wmRef[2][1][0].index = temp221;
		wmRef[2][1][2].index = temp201;
		wmRef[2][2][0].index = temp222;
		wmRef[2][2][1].index = temp212;
		wmRef[2][2][2].index = temp202;
	} else {
		wmRef[2][0][0].index = temp202;
		wmRef[2][0][1].index = temp212;
		wmRef[2][0][2].index = temp222;
		wmRef[2][1][0].index = temp201;
		wmRef[2][1][2].index = temp221;
		wmRef[2][2][0].index = temp200;
		wmRef[2][2][1].index = temp210;
		wmRef[2][2][2].index = temp220;	
	}
}

function rotateLeftFace(deg) {
	updateQuaternion(wmRef[2][0][0].index, deg, 0, 0);
	updateQuaternion(wmRef[2][0][1].index, deg, 0, 0);
	updateQuaternion(wmRef[2][0][2].index, deg, 0, 0);
	updateQuaternion(wmRef[2][1][0].index, deg, 0, 0);
	updateQuaternion(wmRef[2][1][2].index, deg, 0, 0);
	updateQuaternion(wmRef[2][2][0].index, deg, 0, 0);
	updateQuaternion(wmRef[2][2][1].index, deg, 0, 0);
	updateQuaternion(wmRef[2][2][2].index, deg, 0, 0);
}

function frontFace(deg) {
	rotateFrontFace(deg);

	let temp000, temp001, temp002, temp100, temp102, temp200, temp201, temp202;
	temp000 = wmRef[0][0][0].index;
	temp001 = wmRef[0][0][1].index;
	temp002 = wmRef[0][0][2].index;
	temp100 = wmRef[1][0][0].index;
	temp102 = wmRef[1][0][2].index;
	temp200 = wmRef[2][0][0].index;
	temp201 = wmRef[2][0][1].index;
	temp202 = wmRef[2][0][2].index;
	
	if (deg > 0) {
		// clockwise
		wmRef[0][0][0].index = temp200;
		wmRef[0][0][1].index = temp100;
		wmRef[0][0][2].index = temp000;
		wmRef[1][0][0].index = temp201;
		wmRef[1][0][2].index = temp001;
		wmRef[2][0][0].index = temp202;
		wmRef[2][0][1].index = temp102;
		wmRef[2][0][2].index = temp002;
	} else {
		//counterclockwise
		wmRef[0][0][0].index = temp002;
		wmRef[0][0][1].index = temp102;
		wmRef[0][0][2].index = temp202;
		wmRef[1][0][0].index = temp001;
		wmRef[1][0][2].index = temp201;
		wmRef[2][0][0].index = temp000;
		wmRef[2][0][1].index = temp100;
		wmRef[2][0][2].index = temp200;
	}
}

function rotateFrontFace(deg) {
	updateQuaternion(wmRef[0][0][0].index, 0, 0, deg);
	updateQuaternion(wmRef[0][0][1].index, 0, 0, deg);
	updateQuaternion(wmRef[0][0][2].index, 0, 0, deg);
	updateQuaternion(wmRef[1][0][0].index, 0, 0, deg);
	updateQuaternion(wmRef[1][0][2].index, 0, 0, deg);
	updateQuaternion(wmRef[2][0][0].index, 0, 0, deg);
	updateQuaternion(wmRef[2][0][1].index, 0, 0, deg);
	updateQuaternion(wmRef[2][0][2].index, 0, 0, deg);
}

function backFace(deg) {
	rotateBackFace(deg);

	let temp020, temp021, temp022, temp120, temp122, temp220, temp221, temp222;
	temp020 = wmRef[0][2][0].index;
	temp021 = wmRef[0][2][1].index;
	temp022 = wmRef[0][2][2].index;
	temp120 = wmRef[1][2][0].index;
	temp122 = wmRef[1][2][2].index;
	temp220 = wmRef[2][2][0].index;
	temp221 = wmRef[2][2][1].index;
	temp222 = wmRef[2][2][2].index;

	if(deg < 0){
		// clockwise
		wmRef[0][2][0].index = temp022;
		wmRef[0][2][1].index = temp122;
		wmRef[0][2][2].index = temp222;
		wmRef[1][2][0].index = temp021;
		wmRef[1][2][2].index = temp221;
		wmRef[2][2][0].index = temp020;
		wmRef[2][2][1].index = temp120;
		wmRef[2][2][2].index = temp220;
	} else {
		// counterclockwise
		wmRef[0][2][0].index = temp220;
		wmRef[0][2][1].index = temp120;
		wmRef[0][2][2].index = temp020;
		wmRef[1][2][0].index = temp221;
		wmRef[1][2][2].index = temp021;
		wmRef[2][2][0].index = temp222;
		wmRef[2][2][1].index = temp122;
		wmRef[2][2][2].index = temp022;
	}
}

function rotateBackFace(deg) {
	updateQuaternion(wmRef[0][2][0].index, 0, 0, deg);
	updateQuaternion(wmRef[0][2][1].index, 0, 0, deg);
	updateQuaternion(wmRef[0][2][2].index, 0, 0, deg);
	updateQuaternion(wmRef[1][2][0].index, 0, 0, deg);
	updateQuaternion(wmRef[1][2][2].index, 0, 0, deg);
	updateQuaternion(wmRef[2][2][0].index, 0, 0, deg);
	updateQuaternion(wmRef[2][2][1].index, 0, 0, deg);
	updateQuaternion(wmRef[2][2][2].index, 0, 0, deg);
}

function downFace(deg) {
	rotateDownFace(deg);

	let temp000, temp010, temp020, temp100, temp120, temp200, temp210, temp220;
	temp000 = wmRef[0][0][0].index;
	temp010 = wmRef[0][1][0].index;
	temp020 = wmRef[0][2][0].index;
	temp100 = wmRef[1][0][0].index;
	temp120 = wmRef[1][2][0].index;
	temp200 = wmRef[2][0][0].index;
	temp210 = wmRef[2][1][0].index;
	temp220 = wmRef[2][2][0].index;

	if(deg < 0){
		// clockwise
		wmRef[0][0][0].index = temp020;
		wmRef[0][1][0].index = temp120;
		wmRef[0][2][0].index = temp220;
		wmRef[1][0][0].index = temp010;
		wmRef[1][2][0].index = temp210;
		wmRef[2][0][0].index = temp000;
		wmRef[2][1][0].index = temp100;
		wmRef[2][2][0].index = temp200;
	} else {
		// counterclockwise
		wmRef[0][0][0].index = temp200;
		wmRef[0][1][0].index = temp100;
		wmRef[0][2][0].index = temp000;
		wmRef[1][0][0].index = temp210;
		wmRef[1][2][0].index = temp010;
		wmRef[2][0][0].index = temp220;
		wmRef[2][1][0].index = temp120;
		wmRef[2][2][0].index = temp020;
	}
}

function rotateDownFace(deg) {
	updateQuaternion(wmRef[0][0][0].index, 0, deg, 0);
	updateQuaternion(wmRef[0][1][0].index, 0, deg, 0);
	updateQuaternion(wmRef[0][2][0].index, 0, deg, 0);
	updateQuaternion(wmRef[1][0][0].index, 0, deg, 0);
	updateQuaternion(wmRef[1][2][0].index, 0, deg, 0);
	updateQuaternion(wmRef[2][0][0].index, 0, deg, 0);
	updateQuaternion(wmRef[2][1][0].index, 0, deg, 0);
	updateQuaternion(wmRef[2][2][0].index, 0, deg, 0);
}

function upFace(deg) {
	rotateUpFace(deg);

	let temp002, temp012, temp022, temp102, temp122, temp202, temp212, temp222;
	temp002 = wmRef[0][0][2].index;
	temp012 = wmRef[0][1][2].index;
	temp022 = wmRef[0][2][2].index;
	temp102 = wmRef[1][0][2].index;
	temp122 = wmRef[1][2][2].index;
	temp202 = wmRef[2][0][2].index;
	temp212 = wmRef[2][1][2].index;
	temp222 = wmRef[2][2][2].index;

	if(deg < 0){
		// clockwise
		wmRef[0][0][2].index = temp202;
		wmRef[0][1][2].index = temp102;
		wmRef[0][2][2].index = temp002;
		wmRef[1][0][2].index = temp212;
		wmRef[1][2][2].index = temp012;
		wmRef[2][0][2].index = temp222;
		wmRef[2][1][2].index = temp122;
		wmRef[2][2][2].index = temp022;
	} else {
		// counterclockwise
		wmRef[0][0][2].index = temp022;
		wmRef[0][1][2].index = temp122;
		wmRef[0][2][2].index = temp222;
		wmRef[1][0][2].index = temp012;
		wmRef[1][2][2].index = temp212;
		wmRef[2][0][2].index = temp002;
		wmRef[2][1][2].index = temp102;
		wmRef[2][2][2].index = temp202;
	}
}

function rotateUpFace(deg) {
	updateQuaternion(wmRef[0][0][2].index, 0, deg, 0);
	updateQuaternion(wmRef[0][1][2].index, 0, deg, 0);
	updateQuaternion(wmRef[0][2][2].index, 0, deg, 0);
	updateQuaternion(wmRef[1][0][2].index, 0, deg, 0);
	updateQuaternion(wmRef[1][2][2].index, 0, deg, 0);
	updateQuaternion(wmRef[2][0][2].index, 0, deg, 0);
	updateQuaternion(wmRef[2][1][2].index, 0, deg, 0);
	updateQuaternion(wmRef[2][2][2].index, 0, deg, 0);
}

function rotateMiddle(rotation){
	// the rotation must reassign centerCoordinates of each color center involved in the rotation
	if (selectedFace.i === 0) {
		switch(rotation) {
			case "R":
				rotateMiddleHorizontal(90);
				break;
			case "L":
				rotateMiddleHorizontal(-90);
				break;
			case "U":
				rotateMiddleVerticalRightLeft(-90);
				break;
			case "D":
				rotateMiddleVerticalRightLeft(90);
		}
	} else if (selectedFace.i === 2) {
		switch(rotation) {
			case "R":
				rotateMiddleHorizontal(90);
				break;
			case "L":
				rotateMiddleHorizontal(-90);
				break;
			case "U":
				rotateMiddleVerticalRightLeft(90);
				break;
			case "D":
				rotateMiddleVerticalRightLeft(-90);
				break;
		}
	} else {
		if (selectedFace.j === 0) {
			switch(rotation) {
				case "R":
					rotateMiddleHorizontal(90);
					break;
				case "L":
					rotateMiddleHorizontal(-90);
					break;
				case "U":
					rotateMiddleVerticalFrontBack(-90);
					break;
				case "D":
					rotateMiddleVerticalRightLeft(90);
					break;
			}
		} else if (selectedFace.j === 2) {
			switch(rotation) {
				case "R":
					rotateMiddleHorizontal(90);
					break;
				case "L":
					rotateMiddleHorizontal(-90);
					break;
				case "U":
					rotateMiddleVerticalFrontBack(90);
					break;
				case "D":
					rotateMiddleVerticalFrontBack(-90);
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
						rotateMiddleVerticalFrontBack(-90);
						break;
					case "D":
						rotateMiddleVerticalFrontBack(90);
						break;
				}
			} else if (selectedFace.k === 2) {
				switch(rotation) {
					case "R":
						
						break;
					case "L":
						
						break;
					case "U":
						rotateMiddleVerticalFrontBack(-90);
						break;
					case "D":
						rotateMiddleVerticalFrontBack(90);
						break;
				}
			}
		}
	}
}

function rotateMiddleHorizontal(deg) {
	let front, right, back, left;

	front = wmRef[1][0][1].color;
	right = wmRef[0][1][1].color;
	left = wmRef[2][1][1].color;
	back = wmRef[1][2][1].color;

	let temp001, temp021, temp221, temp201;
	temp001 = wmRef[0][0][1].index;
	temp021 = wmRef[0][2][1].index;
	temp221 = wmRef[2][2][1].index;
	temp201 = wmRef[2][0][1].index;

	if(deg > 0){
		//right
		moveCenter(getCoordFromCol(front), "R");
		moveCenter(getCoordFromCol(right), "R");
		moveCenter(getCoordFromCol(back), "R");
		moveCenter(getCoordFromCol(left), "R");

		wmRef[2][1][1].color = back;
		wmRef[1][2][1].color = right;
		wmRef[0][1][1].color = front;
		wmRef[1][0][1].color = left;

		wmRef[0][0][1].index = temp201;
		wmRef[0][2][1].index = temp001;
		wmRef[2][2][1].index = temp021;
		wmRef[2][0][1].index = temp221;


	} else {
		//left
		moveCenter(getCoordFromCol(front), "L");
		moveCenter(getCoordFromCol(right), "L");
		moveCenter(getCoordFromCol(back), "L");
		moveCenter(getCoordFromCol(left), "L");

		wmRef[2][1][1].color = front;
		wmRef[1][2][1].color = left;
		wmRef[0][1][1].color = back;
		wmRef[1][0][1].color = right;

		wmRef[0][0][1].index = temp021;
		wmRef[0][2][1].index = temp221;
		wmRef[2][2][1].index = temp201;
		wmRef[2][0][1].index = temp001;

	}

	updateQuaternion(wmRef[0][0][1].index, 0, deg, 0);
	updateQuaternion(wmRef[0][1][1].index, 0, deg, 0);
	updateQuaternion(wmRef[0][2][1].index, 0, deg, 0);
	updateQuaternion(wmRef[1][0][1].index, 0, deg, 0);
	updateQuaternion(wmRef[1][2][1].index, 0, deg, 0);
	updateQuaternion(wmRef[2][0][1].index, 0, deg, 0);
	updateQuaternion(wmRef[2][1][1].index, 0, deg, 0);
	updateQuaternion(wmRef[2][2][1].index, 0, deg, 0);
}

function moveCenter(coords, direction) {
	if (direction === "R") {
		if (coords.i === 1 && coords.j === 0) {
			coords.i = 0;
			coords.j = 1;
		} else if (coords.i === 0 && coords.j === 1) {
			coords.i = 1;
			coords.j = 2;
		} else if (coords.i === 1 && coords.j === 2) {
			coords.i = 2;
			coords.j = 1;
		} else {
			coords.i = 1;
			coords.j = 0;
		}
	} else {
		if (coords.i === 0 && coords.j === 1) {
			coords.i = 1;
			coords.j = 0;
		} else if (coords.i === 1 && coords.j === 2) {
			coords.i = 0;
			coords.j = 1;
		} else if (coords.i === 2 && coords.j === 1) {
			coords.i = 1;
			coords.j = 2;
		} else {
			coords.i = 2;
			coords.j = 1;
		}
	}
}


function rotateMiddleVerticalFrontBack(deg) {
	updateQuaternion(wmRef[1][0][0].index, deg, 0, 0);
	updateQuaternion(wmRef[1][0][1].index, deg, 0, 0);
	updateQuaternion(wmRef[1][0][2].index, deg, 0, 0);
	updateQuaternion(wmRef[1][1][0].index, deg, 0, 0);
	updateQuaternion(wmRef[1][1][2].index, deg, 0, 0);
	updateQuaternion(wmRef[1][2][0].index, deg, 0, 0);
	updateQuaternion(wmRef[1][2][1].index, deg, 0, 0);
	updateQuaternion(wmRef[1][2][2].index, deg, 0, 0);
}

function rotateMiddleVerticalRightLeft(deg) {
	updateQuaternion(wmRef[0][1][0].index, 0, 0, deg);
	updateQuaternion(wmRef[0][1][1].index, 0, 0, deg);
	updateQuaternion(wmRef[0][1][2].index, 0, 0, deg);
	updateQuaternion(wmRef[1][1][0].index, 0, 0, deg);
	updateQuaternion(wmRef[1][1][2].index, 0, 0, deg);
	updateQuaternion(wmRef[2][1][0].index, 0, 0, deg);
	updateQuaternion(wmRef[2][1][1].index, 0, 0, deg);
	updateQuaternion(wmRef[2][1][2].index, 0, 0, deg);
}

//middle vertical top/bottom missing


function animate(){
	/*interpolation*/
}

//------------------------------------------------------------- DRAW SCENE ---------------------------------------------------------------------

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
					
										
		cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
		cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
		cy = lookRadius * Math.sin(utils.degToRad(-elevation));
		
		 directionalLight = [Math.cos(utils.degToRad(-angle)),
              Math.sin(utils.degToRad(-angle)),
              Math.cos(utils.degToRad(-elevation))
              ];
		
		//console.log(angle);
		//console.log(elevation);

	for (let i = 0; i < 26; i++) {
		gl.useProgram(program);
	
		var perspectiveMatrix = utils.MakePerspective(30, gl.canvas.width/gl.canvas.height, 0.1, 100.0);


		//TODO: devi trovare il modo di indirizzare la luce nella direzione in cui noi stiamo guardando
		
		var viewMatrix = utils.MakeView(cx, cy, cz, elevation,angle);

		var matrixLocation = gl.getUniformLocation(program, "matrix");
		var normalMatrixPositionHandle = gl.getUniformLocation(program, 'nMatrix');
		var worldMatrixLocation = gl.getUniformLocation(program, 'worldMatrix');
		
		var normalMatrix = utils.invertMatrix(utils.transposeMatrix(wmAndQList[i].matrix));

		var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, wmAndQList[i].matrix);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
		
		var lightDirMatrix = utils.transposeMatrix(wmAndQList[i].matrix); 
		var lightdirTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(lightDirMatrix), directionalLight); 
		
		gl.uniform3fv(lightColorHandle,  directionalLightColor);
		gl.uniform3fv(lightDirectionHandle,  lightdirTransformed);
		
		gl.uniformMatrix4fv(matrixLocation , gl.FALSE, utils.transposeMatrix(projectionMatrix));
		gl.uniformMatrix4fv(normalMatrixPositionHandle , gl.FALSE, utils.transposeMatrix(normalMatrix));
		gl.uniformMatrix4fv(worldMatrixLocation , gl.FALSE, utils.transposeMatrix(wmAndQList[i].matrix));
		//mettere qui ligfht dir color
		
		
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
					//wmAndQList[count].matrix = worldMatrix;
					//wmAndQList[count].quaternion = q;
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
	console.log(models[0]);
	
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

function getCoordFromCol(color) {
	switch(color){
		case "white":
			return centerCoordinates.white;
		case "yellow":
			return centerCoordinates.yellow;
		case "blue":
			return centerCoordinates.blue;
		case "red":
			return centerCoordinates.red;
		case "orange":
			return centerCoordinates.orange;
		case "green":
			return centerCoordinates.green;
	}
}

function updateQuaternion(i, rvx, rvy, rvz) {

	//creating quaternion delta_quat
	var delta_quat = Quaternion.fromEuler(utils.degToRad(rvz), utils.degToRad(rvx), utils.degToRad(rvy));
	
	//q'
	q_new = delta_quat.mul(wmAndQList[i].quaternion); //q is the i-th quaternion

	wmAndQList[i].quaternion = q_new; //update of the i-th quaternion

 	//gaining rotation matrix from quaternion
 	out = q_new.toMatrix4();
	//return out; //return the new matrix after rotation 
	wmAndQList[i].matrix = utils.multiplyMatrices(out, utils.MakeScaleMatrix(scale));
}


function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}



window.onload = init;
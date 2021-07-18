var gl;
var baseDir;
var shaderDir;
var image;

var cubes = ["Cube00_B", "Cube00_M", "Cube00", "Cube01_B", "Cube01_M", "Cube01", "Cube02_B", "Cube02_M", "Cube02", "Cube10_B", "Cube10_M", "Cube10", "Cube11_B", "Cube11", "Cube12_B", "Cube12_M", "Cube12", "Cube20_B", "Cube20_M", "Cube20", "Cube21_B", "Cube21_M", "Cube21", "Cube22_B", "Cube22_M", "Cube22"];

var models = new Array();
var vaos = new Array();

var program=new Array();
// 0 -> no lights
// 1 -> lambert refl directional light

var wmAndQList =  new Array();
var wmRef =  new Array();

var centerCoordinates = {};

var positionAttributeLocation=new Array();
var normalsAttributeLocation=new Array();
var lightDirectionHandle=new Array();
var lightColorHandle=new Array();

var lastUpdateTime = null;

var uvLocation=new Array();
var textureFileHandle=new Array();
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

var dirLightAlpha = -utils.degToRad(220);
var dirLightBeta  = -utils.degToRad(100);

 var directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
              Math.sin(dirLightAlpha),
              Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
              ];
			  
var directionalLightColor = [2.0, 2.0, 2.0];

var functionToAnimate = null;
var degToAnimate = 0;
var countAnimate = 0;

var node;
var newNode;

var selectedLight=0;

function onDropdownChange(value){
	if(value==1){
		console.log("esketit1");
		selectedLight=0;
		console.log("esketit1");
	}else{
		if(value==2){
			console.log("esketit2");
			selectedLight=1;
			console.log("esketit2");
		}
	}
}
var last = false;

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

function onAlfaChange(value){
	dirLightAlpha = -utils.degToRad(value);
    console.log("Slider value changed to "+value);
}

function onBetaChange(value){
	dirLightBeta = -utils.degToRad(value);
    console.log("Slider value changed to "+value);
}

var keyFunctionDown = function(e) {
	switch(e.keyCode) {
  		case 87:
			//console.log("KeyDown - White");
			selectedFace = centerCoordinates.white;
			newNode.replaceChildren(document.createTextNode('White'));
			break;
	  	case 89:
			//console.log("KeyDown - Yellow");
			selectedFace = centerCoordinates.yellow;
			newNode.replaceChildren(document.createTextNode('Yellow'));
			break;
	  	case 66:
			//console.log("KeyDown - Blue");
			selectedFace = centerCoordinates.blue;
			newNode.replaceChildren(document.createTextNode('Blue'));
			break;
	  	case 71:
			//console.log("KeyDown - Green");
			selectedFace = centerCoordinates.green;
			newNode.replaceChildren(document.createTextNode('Green'));
			break;
	  	case 82:
			//console.log("KeyDown - Red");
			selectedFace = centerCoordinates.red;
			newNode.replaceChildren(document.createTextNode('Red'));
			break;
	  	case 79:
			//console.log("KeyDown - Orange");
			selectedFace = centerCoordinates.orange;
			newNode.replaceChildren(document.createTextNode('Orange'));
			break;
		case 39:
			//console.log("KeyDown - Right");
			if(shift)
				rotateMiddle("R");
			else
				rotateFace("R");
			window.requestAnimationFrame(drawScene);
			break;
	  	case 37:
			//console.log("KeyDown - Left");
			if(shift)
				rotateMiddle("L");
			else
				rotateFace("L");
			window.requestAnimationFrame(drawScene);
			break;	
		case 38:
			//console.log("KeyDown - Up");
			if(shift) {
				rotateMiddle("U");
				window.requestAnimationFrame(drawScene);
			}
			break;
		case 40:
			//console.log("KeyDown - Down");
			if(shift) {
				rotateMiddle("D");
				window.requestAnimationFrame(drawScene);
			}
			break;
		case 16:
			//console.log("KeyDown - Shift");
			shift = true;
			break;
	}
}

var keyFunctionUp = function(e) {
	if(e.keyCode === 16){
		//console.log("KeyUp - Shift")
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
	
	vaos[0]=[];
	vaos[1]=[];
	
	for(let j=0;j<2;j++){
		
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

function rotateFace(rotation){
	if(functionToAnimate === null){
		if (selectedFace.i === 0) {
			functionToAnimate = rightFace;
			switch(rotation) {
				case "R":
					degToAnimate = -90;
					break;
				case "L":
					degToAnimate = 90; 
			}
		} else if (selectedFace.i === 2) {
			functionToAnimate = leftFace;
			switch(rotation) {
				case "R":
					degToAnimate = 90;
					break;
				case "L":
					degToAnimate = -90;
			}
		} else {
			if (selectedFace.j === 0) {
				functionToAnimate = frontFace;
				switch(rotation) {
					case "R":
						degToAnimate = -90;
						break;
					case "L":
						degToAnimate = 90;
				}
			} else if (selectedFace.j === 2) {
				functionToAnimate = backFace;
				switch(rotation) {
					case "R":
						degToAnimate = 90;
						break;
					case "L":
						degToAnimate = -90;
				}
			} else {
				if (selectedFace.k === 0) {
					functionToAnimate = downFace;
					switch(rotation) {
						case "R":
							degToAnimate = 90;
							break;
						case "L":
							degToAnimate = -90;
					}
				} else if (selectedFace.k === 2) {
					functionToAnimate = upFace;
					switch(rotation) {
						case "R":
							degToAnimate = -90;
							break;
						case "L":
							degToAnimate = 90;
					}
				}
			}
		}
		lastUpdateTime = (new Date).getTime();
	}
}

function rightFace(deg) {
	rotateRightFace(deg);
	
	if (last) {
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
}

function rotateRightFace(deg) {
	updateQuaternion(wmRef[0][0][0].index, deg, 0, 0);
	updateQuaternion(wmRef[0][0][1].index, deg, 0, 0);
	updateQuaternion(wmRef[0][0][2].index, deg, 0, 0);
	updateQuaternion(wmRef[0][1][0].index, deg, 0, 0);
	updateQuaternion(wmRef[0][1][1].index, deg, 0, 0);
	updateQuaternion(wmRef[0][1][2].index, deg, 0, 0);
	updateQuaternion(wmRef[0][2][0].index, deg, 0, 0);
	updateQuaternion(wmRef[0][2][1].index, deg, 0, 0);
	updateQuaternion(wmRef[0][2][2].index, deg, 0, 0);
}

function leftFace(deg) {
	rotateLeftFace(deg);

	if (last) {
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
}

function rotateLeftFace(deg) {
	updateQuaternion(wmRef[2][0][0].index, deg, 0, 0);
	updateQuaternion(wmRef[2][0][1].index, deg, 0, 0);
	updateQuaternion(wmRef[2][0][2].index, deg, 0, 0);
	updateQuaternion(wmRef[2][1][0].index, deg, 0, 0);
	updateQuaternion(wmRef[2][1][1].index, deg, 0, 0);
	updateQuaternion(wmRef[2][1][2].index, deg, 0, 0);
	updateQuaternion(wmRef[2][2][0].index, deg, 0, 0);
	updateQuaternion(wmRef[2][2][1].index, deg, 0, 0);
	updateQuaternion(wmRef[2][2][2].index, deg, 0, 0);
}

function frontFace(deg) {
	rotateFrontFace(deg);

	if (last) {
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
}

function rotateFrontFace(deg) {
	updateQuaternion(wmRef[0][0][0].index, 0, 0, deg);
	updateQuaternion(wmRef[0][0][1].index, 0, 0, deg);
	updateQuaternion(wmRef[0][0][2].index, 0, 0, deg);
	updateQuaternion(wmRef[1][0][0].index, 0, 0, deg);
	updateQuaternion(wmRef[1][0][1].index, 0, 0, deg);
	updateQuaternion(wmRef[1][0][2].index, 0, 0, deg);
	updateQuaternion(wmRef[2][0][0].index, 0, 0, deg);
	updateQuaternion(wmRef[2][0][1].index, 0, 0, deg);
	updateQuaternion(wmRef[2][0][2].index, 0, 0, deg);
}

function backFace(deg) {
	rotateBackFace(deg);

	if (last) {
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
}

function rotateBackFace(deg) {
	updateQuaternion(wmRef[0][2][0].index, 0, 0, deg);
	updateQuaternion(wmRef[0][2][1].index, 0, 0, deg);
	updateQuaternion(wmRef[0][2][2].index, 0, 0, deg);
	updateQuaternion(wmRef[1][2][0].index, 0, 0, deg);
	updateQuaternion(wmRef[1][2][1].index, 0, 0, deg);
	updateQuaternion(wmRef[1][2][2].index, 0, 0, deg);
	updateQuaternion(wmRef[2][2][0].index, 0, 0, deg);
	updateQuaternion(wmRef[2][2][1].index, 0, 0, deg);
	updateQuaternion(wmRef[2][2][2].index, 0, 0, deg);
}

function downFace(deg) {
	rotateDownFace(deg);

	if (last) {
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
}

function rotateDownFace(deg) {
	updateQuaternion(wmRef[0][0][0].index, 0, deg, 0);
	updateQuaternion(wmRef[0][1][0].index, 0, deg, 0);
	updateQuaternion(wmRef[0][2][0].index, 0, deg, 0);
	updateQuaternion(wmRef[1][0][0].index, 0, deg, 0);
	updateQuaternion(wmRef[1][1][0].index, 0, deg, 0);
	updateQuaternion(wmRef[1][2][0].index, 0, deg, 0);
	updateQuaternion(wmRef[2][0][0].index, 0, deg, 0);
	updateQuaternion(wmRef[2][1][0].index, 0, deg, 0);
	updateQuaternion(wmRef[2][2][0].index, 0, deg, 0);
}

function upFace(deg) {
	rotateUpFace(deg);

	if (last) {
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
			wmRef[0][0][2].index = temp022;
			wmRef[0][1][2].index = temp122;
			wmRef[0][2][2].index = temp222;
			wmRef[1][0][2].index = temp012;
			wmRef[1][2][2].index = temp212;
			wmRef[2][0][2].index = temp002;
			wmRef[2][1][2].index = temp102;
			wmRef[2][2][2].index = temp202;
		} else {
			// counterclockwise
			wmRef[0][0][2].index = temp202;
			wmRef[0][1][2].index = temp102;
			wmRef[0][2][2].index = temp002;
			wmRef[1][0][2].index = temp212;
			wmRef[1][2][2].index = temp012;
			wmRef[2][0][2].index = temp222;
			wmRef[2][1][2].index = temp122;
			wmRef[2][2][2].index = temp022;
		}
	}
}

function rotateUpFace(deg) {
	updateQuaternion(wmRef[0][0][2].index, 0, deg, 0);
	updateQuaternion(wmRef[0][1][2].index, 0, deg, 0);
	updateQuaternion(wmRef[0][2][2].index, 0, deg, 0);
	updateQuaternion(wmRef[1][0][2].index, 0, deg, 0);
	updateQuaternion(wmRef[1][1][2].index, 0, deg, 0);
	updateQuaternion(wmRef[1][2][2].index, 0, deg, 0);
	updateQuaternion(wmRef[2][0][2].index, 0, deg, 0);
	updateQuaternion(wmRef[2][1][2].index, 0, deg, 0);
	updateQuaternion(wmRef[2][2][2].index, 0, deg, 0);
}

function rotateMiddle(rotation){
	// the rotation must reassign centerCoordinates of each color center involved in the rotation
	if(functionToAnimate === null){
		if (selectedFace.i === 0) {
			switch(rotation) {
				case "R":
					functionToAnimate = rotateMiddleHorizontal;
					degToAnimate = 90;
					break;
				case "L":
					functionToAnimate = rotateMiddleHorizontal;
					degToAnimate = -90;
					break;
				case "U":
					functionToAnimate = rotateMiddleVerticalRightLeft;
					degToAnimate = 90;
					break;
				case "D":
					functionToAnimate = rotateMiddleVerticalRightLeft;
					degToAnimate = -90;
			}
		} else if (selectedFace.i === 2) {
			switch(rotation) {
				case "R":
					functionToAnimate = rotateMiddleHorizontal;
					degToAnimate = 90;
					break;
				case "L":
					functionToAnimate = rotateMiddleHorizontal;
					degToAnimate = -90;
					break;
				case "U":
					functionToAnimate = rotateMiddleVerticalRightLeft;
					degToAnimate = -90;
					break;
				case "D":
					functionToAnimate = rotateMiddleVerticalRightLeft;
					degToAnimate = 90;
					break;
			}
		} else {
			if (selectedFace.j === 0) {
				switch(rotation) {
					case "R":
						functionToAnimate = rotateMiddleHorizontal;
						degToAnimate = 90;
						break;
					case "L":
						functionToAnimate = rotateMiddleHorizontal;
						degToAnimate = -90;
						break;
					case "U":
						functionToAnimate = rotateMiddleVerticalFrontBack;
						degToAnimate = -90;
						break;
					case "D":
						functionToAnimate = rotateMiddleVerticalFrontBack;
						degToAnimate = 90;
						break;
				}
			} else if (selectedFace.j === 2) {
				switch(rotation) {
					case "R":
						functionToAnimate = rotateMiddleHorizontal;
						degToAnimate = 90;
						break;
					case "L":
						functionToAnimate = rotateMiddleHorizontal;
						degToAnimate = -90;
						break;
					case "U":
						functionToAnimate = rotateMiddleVerticalFrontBack;
						degToAnimate = 90;
						break;
					case "D":
						functionToAnimate = rotateMiddleVerticalFrontBack;
						degToAnimate = -90;
						break;
				}
			} else {
				if (selectedFace.k === 0) {
					switch(rotation) {
						case "R":
							functionToAnimate = rotateMiddleVerticalRightLeft;
							degToAnimate = -90;
							break;
						case "L":
							functionToAnimate = rotateMiddleVerticalRightLeft;
							degToAnimate = 90;
							break;
						case "U":
							functionToAnimate = rotateMiddleVerticalFrontBack;
							degToAnimate = -90;
							break;
						case "D":
							functionToAnimate = rotateMiddleVerticalFrontBack;
							degToAnimate = 90;
							break;
					}
				} else if (selectedFace.k === 2) {
					switch(rotation) {
						case "R":
							functionToAnimate = rotateMiddleVerticalRightLeft;
							degToAnimate = -90;
							break;
						case "L":
							functionToAnimate = rotateMiddleVerticalRightLeft;
							degToAnimate = 90;
							break;
						case "U":
							functionToAnimate = rotateMiddleVerticalFrontBack;
							degToAnimate = -90;
							break;
						case "D":
							functionToAnimate = rotateMiddleVerticalFrontBack;
							degToAnimate = 90;
							break;
					}
				}
			}
		}
		lastUpdateTime = (new Date).getTime();
	}
}

function rotateMiddleHorizontal(deg) {
	updateQuaternion(wmRef[0][0][1].index, 0, deg, 0);
	updateQuaternion(wmRef[0][1][1].index, 0, deg, 0);
	updateQuaternion(wmRef[0][2][1].index, 0, deg, 0);
	updateQuaternion(wmRef[1][0][1].index, 0, deg, 0);
	updateQuaternion(wmRef[1][2][1].index, 0, deg, 0);
	updateQuaternion(wmRef[2][0][1].index, 0, deg, 0);
	updateQuaternion(wmRef[2][1][1].index, 0, deg, 0);
	updateQuaternion(wmRef[2][2][1].index, 0, deg, 0);

	if (last) {
		let front, right, back, left;

		front = wmRef[1][0][1];
		right = wmRef[0][1][1];
		left = wmRef[2][1][1];
		back = wmRef[1][2][1];

		let temp001, temp021, temp221, temp201;
		temp001 = wmRef[0][0][1].index;
		temp021 = wmRef[0][2][1].index;
		temp221 = wmRef[2][2][1].index;
		temp201 = wmRef[2][0][1].index;

		if(deg > 0){
			//right
			moveCenterMiddleHorizontal(getCoordFromCol(front.color), "R");
			moveCenterMiddleHorizontal(getCoordFromCol(right.color), "R");
			moveCenterMiddleHorizontal(getCoordFromCol(back.color), "R");
			moveCenterMiddleHorizontal(getCoordFromCol(left.color), "R");

			wmRef[2][1][1] = back;
			wmRef[1][2][1] = right;
			wmRef[0][1][1] = front;
			wmRef[1][0][1] = left;

			wmRef[0][0][1].index = temp201;
			wmRef[0][2][1].index = temp001;
			wmRef[2][2][1].index = temp021;
			wmRef[2][0][1].index = temp221;


		} else {
			//left
			moveCenterMiddleHorizontal(getCoordFromCol(front.color), "L");
			moveCenterMiddleHorizontal(getCoordFromCol(right.color), "L");
			moveCenterMiddleHorizontal(getCoordFromCol(back.color), "L");
			moveCenterMiddleHorizontal(getCoordFromCol(left.color), "L");

			wmRef[2][1][1] = front;
			wmRef[1][2][1] = left;
			wmRef[0][1][1] = back;
			wmRef[1][0][1] = right;

			wmRef[0][0][1].index = temp021;
			wmRef[0][2][1].index = temp221;
			wmRef[2][2][1].index = temp201;
			wmRef[2][0][1].index = temp001;
		}
	}
}

function moveCenterMiddleHorizontal(coords, direction) {
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

	if (last) {
		let front, up, back, down;

		front = wmRef[1][0][1];
		up = wmRef[1][1][2];
		back = wmRef[1][2][1];
		down = wmRef[1][1][0];

		let temp100, temp102, temp122, temp120;
		temp100 = wmRef[1][0][0].index;
		temp102 = wmRef[1][0][2].index;
		temp122 = wmRef[1][2][2].index;
		temp120 = wmRef[1][2][0].index;

		if(deg > 0){
			//up
			moveCenterMiddleVerticalFrontBack(getCoordFromCol(front.color), "D");
			moveCenterMiddleVerticalFrontBack(getCoordFromCol(up.color), "D");
			moveCenterMiddleVerticalFrontBack(getCoordFromCol(back.color), "D");
			moveCenterMiddleVerticalFrontBack(getCoordFromCol(down.color), "D");

			wmRef[1][1][0] = front;
			wmRef[1][2][1] = down;
			wmRef[1][1][2] = back;
			wmRef[1][0][1] = up;

			wmRef[1][2][0].index = temp100;
			wmRef[1][0][0].index = temp102;
			wmRef[1][0][2].index = temp122;
			wmRef[1][2][2].index = temp120;
		} else {
			//down
			moveCenterMiddleVerticalFrontBack(getCoordFromCol(front.color), "U");
			moveCenterMiddleVerticalFrontBack(getCoordFromCol(up.color), "U");
			moveCenterMiddleVerticalFrontBack(getCoordFromCol(back.color), "U");
			moveCenterMiddleVerticalFrontBack(getCoordFromCol(down.color), "U");

			wmRef[1][1][0] = back;
			wmRef[1][2][1] = up;
			wmRef[1][1][2] = front;
			wmRef[1][0][1] = down;

			wmRef[1][0][2].index = temp100;
			wmRef[1][2][2].index = temp102;
			wmRef[1][2][0].index = temp122;
			wmRef[1][0][0].index = temp120;
		}
	}
}

function moveCenterMiddleVerticalFrontBack(coords, direction) {
	if (direction === "U") {
		if (coords.k === 1 && coords.j === 0) {
			coords.k = 2;
			coords.j = 1;
		} else if (coords.k === 0 && coords.j === 1) {
			coords.k = 1;
			coords.j = 0;
		} else if (coords.k === 1 && coords.j === 2) {
			coords.k = 0;
			coords.j = 1;
		} else {
			coords.k = 1;
			coords.j = 2;
		}
	} else {
		if (coords.k === 0 && coords.j === 1) {
			coords.k = 1;
			coords.j = 2;
		} else if (coords.k === 1 && coords.j === 2) {
			coords.k = 2;
			coords.j = 1;
		} else if (coords.k === 2 && coords.j === 1) {
			coords.k = 1;
			coords.j = 0;
		} else {
			coords.k = 0;
			coords.j = 1;
		}
	}
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

	if (last) {
		let right, up, left, down;

		right = wmRef[0][1][1];
		up = wmRef[1][1][2];
		left = wmRef[2][1][1];
		down = wmRef[1][1][0];

		let temp012, temp212, temp210, temp010;
		temp012 = wmRef[0][1][2].index;
		temp212 = wmRef[2][1][2].index;
		temp210 = wmRef[2][1][0].index;
		temp010 = wmRef[0][1][0].index;

		if(deg > 0){
			//up
			moveCenterMiddleVerticalRightLeft(getCoordFromCol(right.color), "U");
			moveCenterMiddleVerticalRightLeft(getCoordFromCol(up.color), "U");
			moveCenterMiddleVerticalRightLeft(getCoordFromCol(left.color), "U");
			moveCenterMiddleVerticalRightLeft(getCoordFromCol(down.color), "U");

			wmRef[1][1][2] = right;
			wmRef[2][1][1] = up;
			wmRef[1][1][0] = left;
			wmRef[0][1][1] = down;

			wmRef[2][1][2].index = temp012;
			wmRef[2][1][0].index = temp212;
			wmRef[0][1][0].index = temp210;
			wmRef[0][1][2].index = temp010;


		} else {
			//down
			moveCenterMiddleVerticalRightLeft(getCoordFromCol(right.color), "D");
			moveCenterMiddleVerticalRightLeft(getCoordFromCol(up.color), "D");
			moveCenterMiddleVerticalRightLeft(getCoordFromCol(left.color), "D");
			moveCenterMiddleVerticalRightLeft(getCoordFromCol(down.color), "D");

			wmRef[1][1][0] = right;
			wmRef[2][1][1] = down;
			wmRef[1][1][2] = left;
			wmRef[0][1][1] = up;

			wmRef[0][1][0].index = temp012;
			wmRef[0][1][2].index = temp212;
			wmRef[2][1][2].index = temp210;
			wmRef[2][1][0].index = temp010;
		}
	}
}

function moveCenterMiddleVerticalRightLeft(coords, direction){
	if (direction === "U") {
		if (coords.k === 1 && coords.i === 0) {
			coords.k = 2;
			coords.i = 1;
		} else if (coords.k === 0 && coords.i === 1) {
			coords.k = 1;
			coords.i = 0;
		} else if (coords.k === 1 && coords.i === 2) {
			coords.k = 0;
			coords.i = 1;
		} else {
			coords.k = 1;
			coords.i = 2;
		}
	} else {
		if (coords.k === 0 && coords.i === 1) {
			coords.k = 1;
			coords.i = 2;
		} else if (coords.k === 1 && coords.i === 2) {
			coords.k = 2;
			coords.i = 1;
		} else if (coords.k === 2 && coords.i === 1) {
			coords.k = 1;
			coords.i = 0;
		} else {
			coords.k = 0;
			coords.i = 1;
		}
	}
}

function animate(){
	var currentTime = (new Date).getTime();
    if(lastUpdateTime){
		var deltaC = (100 * (currentTime - lastUpdateTime)) / 1000.0;
		if(degToAnimate > 0){
			if(countAnimate + deltaC <= 90){
				if(countAnimate + deltaC == 90){
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
				if(countAnimate + deltaC == 90){
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
	
	/*let count = 0;
	for(let i = 0; i < 3; i++)
		for (let j = 0; j < 3; j++)
			for (let k = 0; k < 3; k++) {
				if (!(i === 1 && j === 1 && k === 1)) {*/
					//console.log(count);
					
										
	cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
	cy = lookRadius * Math.sin(utils.degToRad(-elevation));
	
	directionalLight = [Math.cos(dirLightAlpha) * Math.cos(dirLightBeta),
          Math.sin(dirLightAlpha),
          Math.cos(dirLightAlpha) * Math.sin(dirLightBeta)
          ];
	
	//console.log(angle);
	//console.log(elevation);

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

window.onload = init;
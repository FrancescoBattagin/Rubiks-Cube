var lookRadius = 23.0;

var mouseState = false;
var lastMouseX = -100, lastMouseY = -100;

var selectedLight = 0;

var selectedFace = null;

var shift = false;

function onDropdownChange(value){
	if(value == 1){
		selectedLight = 0;
	}else{
		if(value == 2){
			selectedLight = 1;
		}
	}
}

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
		
		if((dx !== 0) || (dy !== 0)) {
			angle = angle + 0.5 * dx;
			elevation = elevation + 0.5 * dy;
		}
	}
}

function doMouseWheel(event) {
	var nLookRadius = lookRadius + event.wheelDelta / 200.0;
	if((nLookRadius > 2.0) && (nLookRadius < 100.0)) {
		lookRadius = nLookRadius;
	}
}

function onAlfaChange(value){
	dirLightAlpha = -utils.degToRad(value);
}

function onBetaChange(value){
	dirLightBeta = -utils.degToRad(value);
}

var keyFunctionDown = function(e) {
	let face = document.getElementById("face");
	switch(e.keyCode) {
  		case 87:
			selectedFace = centerCoordinates.white;
			face.setAttribute("class", "white");
			face.innerText = "White";
			break;
	  	case 89:
			selectedFace = centerCoordinates.yellow;
			face.setAttribute("class", "yellow");
			face.innerText = "Yellow";
			break;
	  	case 66:
			selectedFace = centerCoordinates.blue;
			face.setAttribute("class", "blue");
			face.innerText = "Blue";
			break;
	  	case 71:
			selectedFace = centerCoordinates.green;
			face.setAttribute("class", "green");
			face.innerText = "Green";
			break;
	  	case 82:
			selectedFace = centerCoordinates.red;
			face.setAttribute("class", "red");
			face.innerText = "Red";
			break;
	  	case 79:
			selectedFace = centerCoordinates.orange;
			face.setAttribute("class", "orange");
			face.innerText = "Orange";
			break;
		case 39:
			if(shift)
				rotateMiddle("R");
			else
				rotateFace("R");
			window.requestAnimationFrame(drawScene);
			break;
	  	case 37:
			if(shift)
				rotateMiddle("L");
			else
				rotateFace("L");
			window.requestAnimationFrame(drawScene);
			break;	
		case 38:
			if(shift) {
				rotateMiddle("U");
				window.requestAnimationFrame(drawScene);
			}
			break;
		case 40:
			if(shift) {
				rotateMiddle("D");
				window.requestAnimationFrame(drawScene);
			}
			break;
		case 16:
			shift = true;
			break;
	}
}

var keyFunctionUp = function(e) {
	if(e.keyCode === 16){
		shift = false;
	}
}

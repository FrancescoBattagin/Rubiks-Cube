var selectedFace = null;

var shift;

var functionToAnimate = null;
var degToAnimate = 0;
var countAnimate = 0;

var last = false;

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

var selectedFace = null;

var shift;

var functionToAnimate = null;
var degToAnimate = 0;
var countAnimate = 0;

var last = false;

function switchRefs(refs, temps) {
	for (let i in refs) {
		refs[i].index = temps[i];
	}
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

function rotate(refs, deg, face) {
	if (face === "R" || face === "L") {
		for (let i in refs) {
			updateQuaternion(refs[i].index, deg, 0, 0);
		}

		if (face === "R") {
			updateQuaternion(wmRef[0][1][1].index, deg, 0, 0);
		} else {
			updateQuaternion(wmRef[2][1][1].index, deg, 0, 0);
		}

	} else if (face === "F" || face === "B") {
		for (let i in refs) {
			updateQuaternion(refs[i].index, 0, 0, deg);
		}
		if (face === "F") {
			updateQuaternion(wmRef[1][0][1].index, 0, 0, deg);
		} else {
			updateQuaternion(wmRef[1][2][1].index, 0, 0, deg);
		}
	} else {
		for (let i in refs) {
			updateQuaternion(refs[i].index, 0, deg, 0);
		}
		if (face === "U") {
			updateQuaternion(wmRef[1][1][2].index, 0, deg, 0);
		} else {
			updateQuaternion(wmRef[1][1][0].index, 0, deg, 0);
		}
	}
}

function rightFace(deg) {
	let refs = [wmRef[0][0][0], wmRef[0][0][1], wmRef[0][0][2], wmRef[0][1][0], wmRef[0][1][2], wmRef[0][2][0], wmRef[0][2][1], wmRef[0][2][2]];
	rotate(refs, deg, "R");
	
	if (last) {
		let initTemps = [];
		let temps;

		for (let i in refs) {
			initTemps[i] = refs[i].index;
		}
		
		if(deg > 0){
			// counterclockwise
			temps = [initTemps[2], initTemps[4], initTemps[7], initTemps[1], initTemps[6], initTemps[0], initTemps[3], initTemps[5]];
		} else {
			// clockwise
			temps = [initTemps[5], initTemps[3], initTemps[0], initTemps[6], initTemps[1], initTemps[7], initTemps[4], initTemps[2]];
		}
		switchRefs(refs, temps);
	}
}

function leftFace(deg) {
	let refs = [wmRef[2][0][0], wmRef[2][0][1], wmRef[2][0][2], wmRef[2][1][0], wmRef[2][1][2], wmRef[2][2][0], wmRef[2][2][1], wmRef[2][2][2]];
	rotate(refs, deg, "L");

	if (last) {
		let initTemps = [];
		let temps;

		for (let i in refs) {
			initTemps[i] = refs[i].index;
		}
		
		if (deg < 0) {
			// counterclockwise
			temps = [initTemps[5], initTemps[3], initTemps[0], initTemps[6], initTemps[1], initTemps[7], initTemps[4], initTemps[2]];
		} else {
			// clockwise
			temps = [initTemps[2], initTemps[4], initTemps[7], initTemps[1], initTemps[6], initTemps[0], initTemps[3], initTemps[5]];
		}
		switchRefs(refs, temps);
	}
}

function frontFace(deg) {
	let refs = [wmRef[0][0][0], wmRef[0][0][1], wmRef[0][0][2], wmRef[1][0][0], wmRef[1][0][2], wmRef[2][0][0], wmRef[2][0][1], wmRef[2][0][2]];
	rotate(refs, deg, "F");

	if (last) {
		let initTemps = [];
		let temps;
		
		for (let i in refs) {
			initTemps[i] = refs[i].index;
		}

		if (deg > 0) {
			// clockwise
			temps = [initTemps[5], initTemps[3], initTemps[0], initTemps[6], initTemps[1], initTemps[7], initTemps[4], initTemps[2]];
		} else {
			//counterclockwise
			temps = [initTemps[2], initTemps[4], initTemps[7], initTemps[1], initTemps[6], initTemps[0], initTemps[3], initTemps[5]];
		}
		switchRefs(refs, temps);
	}
}

function backFace(deg) {
	let refs = [wmRef[0][2][0], wmRef[0][2][1], wmRef[0][2][2], wmRef[1][2][0], wmRef[1][2][2], wmRef[2][2][0], wmRef[2][2][1], wmRef[2][2][2]];
	rotate(refs, deg, "B");

	if (last) {
		let initTemps = [];
		let temps;

		for (let i in refs) {
			initTemps[i] = refs[i].index;
		}

		if(deg < 0){
			// clockwise
			temps = [initTemps[2], initTemps[4], initTemps[7], initTemps[1], initTemps[6], initTemps[0], initTemps[3], initTemps[5]];
		} else {
			// counterclockwise
			temps = [initTemps[5], initTemps[3], initTemps[0], initTemps[6], initTemps[1], initTemps[7], initTemps[4], initTemps[2]];
		}
		switchRefs(refs, temps);
	}
}

function downFace(deg) {
	let refs = [wmRef[0][0][0], wmRef[0][1][0], wmRef[0][2][0], wmRef[1][0][0], wmRef[1][2][0], wmRef[2][0][0], wmRef[2][1][0], wmRef[2][2][0]];
	rotate(refs, deg, "D");

	if (last) {
		let initTemps = [];
		let temps;

		for (let i in refs) {
			initTemps[i] = refs[i].index;
		}

		if(deg < 0){
			// clockwise
			temps = [initTemps[2], initTemps[4], initTemps[7], initTemps[1], initTemps[6], initTemps[0], initTemps[3], initTemps[5]];
		} else {
			// counterclockwise
			temps = [initTemps[5], initTemps[3], initTemps[0], initTemps[6], initTemps[1], initTemps[7], initTemps[4], initTemps[2]];
		}
		switchRefs(refs, temps);
	}
}

function upFace(deg) {
	let refs = [wmRef[0][0][2], wmRef[0][1][2], wmRef[0][2][2], wmRef[1][0][2], wmRef[1][2][2], wmRef[2][0][2], wmRef[2][1][2], wmRef[2][2][2]];
	rotate(refs, deg, "U");

	if (last) {
		let initTemps = [];
		let temps;

		for (let i in refs) {
			initTemps[i] = refs[i].index;
		}

		if(deg < 0){
			// clockwise
			temps = [initTemps[2], initTemps[4], initTemps[7], initTemps[1], initTemps[6], initTemps[0], initTemps[3], initTemps[5]];
		} else {
			// counterclockwise
			temps = [initTemps[5], initTemps[3], initTemps[0], initTemps[6], initTemps[1], initTemps[7], initTemps[4], initTemps[2]];
		}
		switchRefs(refs, temps);
	}
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
	
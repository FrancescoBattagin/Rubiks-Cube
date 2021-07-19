async function importObject(name) { 
    var objStr = await utils.get_objstr("assets/" + name + ".obj");
    var objModel = new OBJ.Mesh(objStr);
    return objModel;
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
	var delta_quat = Quaternion.fromEuler(utils.degToRad(rvz), utils.degToRad(rvx), utils.degToRad(rvy));
	
	q_new = delta_quat.mul(wmAndQList[i].quaternion);

	wmAndQList[i].quaternion = q_new;

 	out = q_new.toMatrix4();
	wmAndQList[i].matrix = utils.multiplyMatrices(out, utils.MakeScaleMatrix(scale));
}

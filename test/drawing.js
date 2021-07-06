var programs = new Array();
var gl;
var baseDir;
var shaderDir;

var models = new Array();

var vaos = new Array();

var positionAttributeLocation=new Array();

var normalsAttributeLocation=new Array();

var Tx = 0.0;
var Ty = 0.0;
var Tz = 0.0;
var Rx = 60.0;
var Ry = 20.0;
var Rz = 10.0;
var S  = 0.5;

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
	
	for(let j=0;j<3;j++){
		
		positionAttributeLocation[j] = gl.getAttribLocation(programs[j], "a_position");  
		//normalsAttributeLocation[j] = gl.getAttribLocation(programs[j], "a_normal");
		
	}
	
	
	for(let i=0; i< 26;i++){
		
		vaos[i]=gl.createVertexArray();
		gl.bindVertexArray(vaos[i]);
	
		
		var positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].vertices), gl.STATIC_DRAW);
		//console.log(positionAttributeLocation);
		//console.log(models[i].vertices);
		
		if(i<8){
			gl.enableVertexAttribArray(positionAttributeLocation[0]);
			gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);
		}
		if(i>=8 && i<17){
			gl.enableVertexAttribArray(positionAttributeLocation[1]);
			gl.vertexAttribPointer(positionAttributeLocation[1], 3, gl.FLOAT, false, 0, 0);
		}
		if(i>=17){
			gl.enableVertexAttribArray(positionAttributeLocation[2]);
			gl.vertexAttribPointer(positionAttributeLocation[2], 3, gl.FLOAT, false, 0, 0);
		}


		/*var normalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].normals), gl.STATIC_DRAW);
		console.log(models[i].indices);
		gl.enableVertexAttribArray(normalsAttributeLocation);
		gl.vertexAttribPointer(normalsAttributeLocation, 3, gl.FLOAT, false, 0, 0);*/

		var indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(models[i].indices), gl.STATIC_DRAW);
		
	}
	
	
	
	
    drawScene();

}

function animate(){
	
}

function drawScene() {
	
	animate();
	
	   gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    for(let i = 0; i < 3; i++){
		
		gl.useProgram(programs[i]);
		
		var worldMatrix = utils.MakeWorld(Tx, Ty, Tz, Rx, Ry, Rz, S);
		var perspectiveMatrix = utils.MakePerspective(30, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
		var viewMatrix = utils.MakeView(0, 0.0, 10.0, 1.0, 0.0);

	   
		var matrixLocation = gl.getUniformLocation(programs[i], "matrix");
		var normalMatrixPositionHandle = gl.getUniformLocation(programs[i], 'nMatrix');
		
		var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatrix));


		var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
		var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
		
		gl.uniformMatrix4fv(matrixLocation , gl.FALSE, utils.transposeMatrix(projectionMatrix));
		gl.uniformMatrix4fv(normalMatrixPositionHandle , gl.FALSE, utils.transposeMatrix(normalMatrix));
		
		if(i==0){
			for(let j=0; j<8;j++){
				gl.bindVertexArray(vaos[j]);

				gl.drawElements(gl.TRIANGLES, models[j].indices.length, gl.UNSIGNED_SHORT, 0);
			}
		}
		if(i==1){
			for(let j=8; j<17;j++){
				gl.bindVertexArray(vaos[j]);

				gl.drawElements(gl.TRIANGLES, models[j].indices.length, gl.UNSIGNED_SHORT, 0);
			}
		}
		if(i==2){
			for(let j=17; j<26;j++){
				gl.bindVertexArray(vaos[j]);

				gl.drawElements(gl.TRIANGLES, models[j].indices.length, gl.UNSIGNED_SHORT, 0);
			}
		
		}
		
	}
  }

async function init() {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir+"shaders/";
    
    var canvas = document.getElementById("c");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    utils.resizeCanvasToDisplaySize(gl.canvas);

    for (let i = 0, count = 0; i < 26; i++) {
        if (count === 0) {
            await utils.loadFiles([shaderDir + "vs.glsl", shaderDir + "fs.glsl"], function (shaderText) {
                var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
                var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

                programs[i] = utils.createProgram(gl, vertexShader, fragmentShader);
            });
            count++;
        } else if (count === 1) {
            await utils.loadFiles([shaderDir + "vs1.glsl", shaderDir + "fs1.glsl"], function (shaderText) {
                var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
                var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

                programs[i] = utils.createProgram(gl, vertexShader, fragmentShader);
            });
            count++;
        } else {
            await utils.loadFiles([shaderDir + "vs2.glsl", shaderDir + "fs2.glsl"], function (shaderText) {
                var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
                var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

                programs[i] = utils.createProgram(gl, vertexShader, fragmentShader);
            });
            count = 0;
        }
    }
    

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
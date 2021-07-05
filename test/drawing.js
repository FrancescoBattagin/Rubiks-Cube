var programs = new Array();
var gl;
var baseDir;
var shaderDir;

var models = new Array();

var vao = new Array();

var Tx = 0.0;
var Ty = 0.0;
var Tz = 0.0;
var S  = 1.0;

async function importObject(name) { 
    var objStr = await utils.get_objstr("assets/" + name + ".obj");
    var objModel = new OBJ.Mesh(objStr);
    return objModel;
}

function main() {
    /*gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);*/

    for (let i = 0; i < 26; i++) {
        drawScene(i);
    }
}

function drawScene(i) {
    gl.useProgram(programs[i]);
    
    var worldMatrix = utils.MakeWorld(Tx, Ty, Tz, 0.0, 0.0, 0.0, S);
    var perspectiveMatrix = utils.MakePerspective(120, gl.canvas.width/gl.canvas.height, 0.1, 100.0);
    var viewMatrix = utils.MakeView(0, 0.0, 3.0, 0.0, 0.0);

    var positionAttributeLocation = gl.getAttribLocation(programs[i], "a_position");  
    //var normalsAttributeLocation = gl.getAttribLocation(programs[i], "a_normal");
   
    var matrixLocation = gl.getUniformLocation(programs[i], "matrix");
    var normalMatrixPositionHandle = gl.getUniformLocation(programs[i], 'nMatrix');
    
    var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldMatrix));
    //vao[i] = gl.createVertexArray();

    //gl.bindVertexArray(vao[i]);
    
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].vertices), gl.STATIC_DRAW);
    //console.log(positionAttributeLocation);
    //console.log(models[i].vertices);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    /*var normalsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(models[i].normals), gl.STATIC_DRAW);
    console.log(models[i].indices);
    gl.enableVertexAttribArray(normalsAttributeLocation);
    gl.vertexAttribPointer(normalsAttributeLocation, 3, gl.FLOAT, false, 0, 0);*/

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(models[i].indices), gl.STATIC_DRAW);

    var viewWorldMatrix = utils.multiplyMatrices(viewMatrix, worldMatrix);
    var projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix);
    
    gl.uniformMatrix4fv(matrixLocation , gl.FALSE, utils.transposeMatrix(projectionMatrix));
    gl.uniformMatrix4fv(normalMatrixPositionHandle , gl.FALSE, utils.transposeMatrix(normalMatrix ));

    gl.drawElements(gl.TRIANGLES, models[i].indices.length, gl.UNSIGNED_SHORT, 0);
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

    for (let i = 0; i < 26; i++) {
        await utils.loadFiles([shaderDir + "vs.glsl", shaderDir + "fs.glsl"], function (shaderText) {
            var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
            var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

            programs[i] = utils.createProgram(gl, vertexShader, fragmentShader);
        });    
    }
    

    models[0] = await importObject("Cube00_B");
    models[1] = await importObject("Cube00_M");
    models[2] = await importObject("Cube00");
    models[3] = new OBJ.Mesh("Cube01_B");
    models[4] = new OBJ.Mesh("Cube01_M");
    models[5] = new OBJ.Mesh("Cube01");
    models[6] = new OBJ.Mesh("Cube02_B");
    models[7] = new OBJ.Mesh("Cube02_M");
    models[8] = new OBJ.Mesh("Cube02");
    models[9] = new OBJ.Mesh("Cube10_B");
    models[10] = new OBJ.Mesh("Cube10_M");
    models[11] = new OBJ.Mesh("Cube10");
    models[12] = new OBJ.Mesh("Cube11_B");
    models[13] = new OBJ.Mesh("Cube11");
    models[14] = new OBJ.Mesh("Cube12_B");
    models[15] = new OBJ.Mesh("Cube12_M");
    models[16] = new OBJ.Mesh("Cube12");
    models[17] = new OBJ.Mesh("Cube20_B");
    models[18] = new OBJ.Mesh("Cube20_M");
    models[19] = new OBJ.Mesh("Cube20");
    models[20] = new OBJ.Mesh("Cube21_B");
    models[21] = new OBJ.Mesh("Cube21_M");
    models[22] = new OBJ.Mesh("Cube21");
    models[23] = new OBJ.Mesh("Cube22_B");
    models[24] = new OBJ.Mesh("Cube22_M");
    models[25] = new OBJ.Mesh("Cube22");

    main();
}

window.onload = init;
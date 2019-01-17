import { positions as cube_positions, colors as cube_colors } from './cube.js';
import { positions as square_positions, colors as square_colors, } from './square.js';

/**
 * Set up the WebGL context and start rendering content.
 */
function main() {
    /**
     * @type {HTMLCanvasElement} HTML canvas element
     */
    const canvas = document.querySelector("#mainCanvas");

    /**
     * @type {WebGLRenderingContext} WebGL rendering context.
     */
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    /**
     * Vertex shader program source code.
     * @type {String}
     */
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }
    `;

    /**
     * Fragment shader program source code.
     * @type {String}
     */
    const fsSource = `
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
    `;

    /**
     * @type {WebGLProgram} WebGL program.
     */
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    const buffers = initBuffers(gl);

    /**
     * Time of last animation
     * @type {Number}
     */
    let then = 0;

    /**
     * Rotation of the square
     * @type {Number}
     */
    let squareRotation = 0.0;

    /**
     * Draw the scene repeatedly.
     * @param {Number} now Time in milliseconds since the page loaded.
     */
    function render(now) {
        now *= 0.001;  // convert to seconds

        squareRotation += now - then;

        drawScene(gl, programInfo, buffers, squareRotation);

        then = now;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

/**
 * Initialize a shader program, so WebGL knows how to draw our data.
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 * @param {String} vsSource Vertex shader program source code.
 * @param {String} fsSource Fragment shader program source code.
 * @returns {WebGLProgram} WebGL program.
 */
function initShaderProgram(gl, vsSource, fsSource) {
    /**
     * @type {WebGLShader} WebGL shader.
     */
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);

    /**
     * @type {WebGLShader} WebGL shader.
     */
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    /**
     * @type {WebGLProgram} WebGL shader.
     */
    const shaderProgram = gl.createProgram();

    // Attatch the vertex shader to the shader program.
    gl.attachShader(shaderProgram, vertexShader);

    // Attatch the fragment shader to the shader program.
    gl.attachShader(shaderProgram, fragmentShader);

    // Link the shader program to the webGL rendering context.
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

/**
 * Creates a shader of the given type, uploads the source and compiles it.
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 * @param {Number} type Shader type to load.
 * @param {String} source Shader program source code.
 * @returns {WebGLShader} WebGL shader.
 */
function loadShader(gl, type, source) {
    /**
     * @type {WebGLShader}
     */
    const shader = gl.createShader(type);

    // Send the source code to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

/**
 * Create buffer.
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 * @returns {{square_buffers:{position: WebGLBuffer,color: WebGLBuffer},cube_buffers: {position: WebGLBuffer,color: WebGLBuffer,}}} Complex object.
 */
function initBuffers(gl) {

    /**
     * Populate buffer with data.
     * @param {WebGLBuffer} webGLBuffer Web GL buffer.
     * @param {Number[]} bufferData Buffer data.
     */
    function populateBuffer(webGLBuffer, bufferData) {

        // Select the buffer to apply buffer operations to from here out.
        gl.bindBuffer(gl.ARRAY_BUFFER, webGLBuffer);

        // Pass the list into WebGL by creating a Float32Array from the JavaScript array,
        //then use it to fill the current buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bufferData), gl.STATIC_DRAW);
    }

    /**
     * Buffer to store the vertex positions.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const square_positionBuffer = gl.createBuffer();

    /**
     * Buffer to store the vertex colors.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const square_colorBuffer = gl.createBuffer();

    // Populate position buffer with position data.
    populateBuffer(square_positionBuffer, square_positions);

    // Populate color buffer with color data.
    populateBuffer(square_colorBuffer, square_colors);

    /**
     * Buffer to store the vertex positions of a cube.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const cube_positionBuffer = gl.createBuffer();

    /**
     * Buffer to store the vertex positions of a cube.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const cube_colorBuffer = gl.createBuffer();

    // Populate position buffer with position data.
    populateBuffer(cube_positionBuffer, cube_positions);

    // Populate position buffer with position data.
    populateBuffer(cube_colorBuffer, cube_colors);

    return {
        square_buffers: {
            position: square_positionBuffer,
            color: square_colorBuffer,
        },
        cube_buffers: {
            position: cube_positionBuffer,
            color: cube_colorBuffer,
        }
    };
}

/**
 * 
 * @param {WebGLRenderingContext} gl WebGL rendering context. 
 * @param {{ program: WebGLProgram, attribLocations: { vertexPosition: number, vertexColor: number }, uniformLocations: { projectionMatrix: WebGLUniformLocation, modelViewMatrix: WebGLUniformLocation }}} programInfo 
 * @param {{square_buffers:{position: WebGLBuffer,color: WebGLBuffer},cube_buffers: {position: WebGLBuffer,color: WebGLBuffer,}}} buffers 
 * @param {Number} squareRotation Current rotation of the square. 
 */
function drawScene(gl, programInfo, buffers, squareRotation) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /**
     * Field of view is 45 degrees in radians.
     * @type {Number} Degrees in radians.
     */
    const fieldOfView = 45 * Math.PI / 180;

    /**
     * Ratio that matches the display size of the canvas.
     * @type {Number} width/height 
     */
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    /**
     * Minimum visibility threshold.
     * @type {Number}
     */
    const zNear = 0.1;

    /**
     * Maximum visibility threshold.
     * @type {Number}
     */
    const zFar = 100.0;

    /**
     * Perspective matrix, a special matrix that is used to simulate the distortion of perspective in a camera.
     * @type {mat4} 4x4 Matrix.
     */
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is the center of the scene.
    const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(modelViewMatrix,     // destination matrix
        modelViewMatrix,     // matrix to translate
        [-0.0, 0.0, -6.0]);  // amount to translate

    mat4.rotate(modelViewMatrix,  // destination matrix
        modelViewMatrix,  // matrix to rotate
        squareRotation,   // amount to rotate in radians
        [0, 0, 1]);       // axis to rotate around

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute.
    {
        const numComponents = 2;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next, 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.square_buffers.position);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer into the vertexColor attribute.
    {
        const numComponents = 4;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next, 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.square_buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

window.onload = main;

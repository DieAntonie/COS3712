import {
    initShaderProgram,
    ProgramData
} from './shaders.js';

import {
    initBuffers,
    BufferData
} from './buffers.js';

import {
    loadTexture
} from './textures.js';

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

    /**
     * @type {ProgramData} WebGL program.
     */
    const program_data = initShaderProgram(gl);

    /**
     * @type {BufferData}
     */
    const buffer_data = initBuffers(gl);

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

        drawCubeScene(gl, program_data, buffer_data, squareRotation);

        then = now;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

/**
 * 
 * @param {WebGLRenderingContext} gl WebGL rendering context. 
 * @param {ProgramData} program_data 
 * @param {BufferData} buffer_data 
 * @param {Number} squareRotation Current rotation of the square. 
 */
function drawSquareScene(gl, program_data, buffer_data, squareRotation) {
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
        [0, 1, 1]);       // axis to rotate around

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute.
    {
        const numComponents = 2;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next, 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer_data.square_buffers.position);
        gl.vertexAttribPointer(
            program_data.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            program_data.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer into the vertexColor attribute.
    {
        const numComponents = 4;  // pull out 2 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next, 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer_data.square_buffers.color);
        gl.vertexAttribPointer(
            program_data.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            program_data.attribLocations.vertexColor);
    }

    // Tell WebGL how to pull out the colors from the color buffer into the vertexColor attribute.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_data.cube_buffers.indices);

    // Tell WebGL to use our program when drawing
    gl.useProgram(program_data.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        program_data.uniformLocations.projectionMatrix,
        false,
        projectionMatrix);

    gl.uniformMatrix4fv(
        program_data.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix);

    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}

/**
 * 
 * @param {WebGLRenderingContext} gl WebGL rendering context. 
 * @param {ProgramData} program_data 
 * @param {BufferData} buffer_data 
 * @param {Number} squareRotation Current rotation of the square. 
 */
function drawCubeScene(gl, program_data, buffer_data, squareRotation) {
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
        [2, -2, 0]);       // axis to rotate around

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute.
    {
        const numComponents = 3;  // pull out 3 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next, 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer_data.cube_buffers.position);
        gl.vertexAttribPointer(
            program_data.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            program_data.attribLocations.vertexPosition);
    }

    // Tell WebGL how to pull out the colors from the color buffer into the vertexColor attribute.
    {
        const numComponents = 4;  // pull out 4 values per iteration
        const type = gl.FLOAT;    // the data in the buffer is 32bit floats
        const normalize = false;  // don't normalize
        const stride = 0;         // how many bytes to get from one set of values to the next, 0 = use type and numComponents above
        const offset = 0;         // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer_data.cube_buffers.color);
        gl.vertexAttribPointer(
            program_data.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            program_data.attribLocations.vertexColor);
    }

    // Tell WebGL how to pull out the colors from the color buffer into the vertexColor attribute.
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer_data.cube_buffers.indices);

    // Tell WebGL to use our program when drawing
    gl.useProgram(program_data.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(
        program_data.uniformLocations.projectionMatrix,
        false,
        projectionMatrix
    );

    gl.uniformMatrix4fv(
        program_data.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix
    );

    {
        const vertexCount = 36;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

window.onload = main;

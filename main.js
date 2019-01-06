/**
 * Set up the WebGL context and start rendering content.
 */
function main() {
    /**
     * @type {HTMLCanvasElement}
     */
    const canvas = document.querySelector("#mainCanvas");

    /**
     * @type {WebGLRenderingContext}
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
}

/**
 * Initialize a shader program, so WebGL knows how to draw our data.
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 * @param {String} vsSource Vertex shader program.
 * @param {String} fsSource Fragment shader program.
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
 * @param {String} source Shader program.
 * @returns {WebGLShader} WebGL shader.
 */
function loadShader(gl, type, source) {
    /**
     * @type {WebGLShader}
     */
    const shader = gl.createShader(type);

    // Send the source to the shader object
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

window.onload = main;



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
* Initialize a shader program, so WebGL knows how to draw our data.
* @param {WebGLRenderingContext} gl WebGL rendering context.
* @param {String} vsSource Vertex shader program source code.
* @param {String} fsSource Fragment shader program source code.
* @returns {ProgramData} WebGL program data.
*/
function initShaderProgram(gl) {
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

    return new ProgramData(gl, shaderProgram);
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

class ProgramData {
    constructor(gl, shaderProgram) {
        this.program = shaderProgram;
        this.attribLocations = {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        };
        this.uniformLocations = {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        };
    }
}

export { initShaderProgram, ProgramData };

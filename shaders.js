

/**
* Vertex shader program source code.
* @type {String}
*/
const flat_vertex_shader_source = `
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
const flat_fragment_shader_source = `
    varying lowp vec4 vColor;

    void main() {
        gl_FragColor = vColor;
    }
`;

/**
* Vertex shader program source code.
* @type {String}
*/
const texture_vertex_shader_source = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;
    }
`;

/**
* Fragment shader program source code.
* @type {String}
*/
const texture_fragment_shader_source = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main() {
        gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
`;
/**
* Initialize a shader program, so WebGL knows how to draw our data.
* @param {WebGLRenderingContext} gl WebGL rendering context.
* @returns {ProgramData} WebGL program data.
*/
function initShaderProgram(gl) {
    /**
    * @type {WebGLShader} WebGL shader.
    */
    const flat_vertex_shader = loadShader(gl, gl.VERTEX_SHADER, flat_vertex_shader_source);

    /**
    * @type {WebGLShader} WebGL shader.
    */
    const flat_fragment_shader = loadShader(gl, gl.FRAGMENT_SHADER, flat_fragment_shader_source);

    /**
    * @type {WebGLProgram} WebGL shader.
    */
    const flat_shader_program = gl.createProgram();

    // Attatch the vertex shader to the shader program.
    gl.attachShader(flat_shader_program, flat_vertex_shader);

    // Attatch the fragment shader to the shader program.
    gl.attachShader(flat_shader_program, flat_fragment_shader);

    // Link the shader program to the webGL rendering context.
    gl.linkProgram(flat_shader_program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(flat_shader_program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(flat_shader_program));
        return null;
    }

    const flat_program_data = new FlatProgramData(gl, flat_shader_program);

    /**
    * @type {WebGLShader} WebGL shader.
    */
    const texture_vertex_shader = loadShader(gl, gl.VERTEX_SHADER, texture_vertex_shader_source);

    /**
    * @type {WebGLShader} WebGL shader.
    */
    const texture_fragment_shader = loadShader(gl, gl.FRAGMENT_SHADER, texture_fragment_shader_source);

    /**
    * @type {WebGLProgram} WebGL shader.
    */
    const texture_shader_program = gl.createProgram();

    // Attatch the vertex shader to the shader program.
    gl.attachShader(texture_shader_program, texture_vertex_shader);

    // Attatch the fragment shader to the shader program.
    gl.attachShader(texture_shader_program, texture_fragment_shader);

    // Link the shader program to the webGL rendering context.
    gl.linkProgram(texture_shader_program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(texture_shader_program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(texture_shader_program));
        return null;
    }

    const texture_program_data = new TexturedProgramData(gl, texture_shader_program);

    return texture_program_data;
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
    constructor(gl, shader_program, mode) {
        this.program = shader_program;
        this.attribLocations = {
            vertexPosition: gl.getAttribLocation(shader_program, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shader_program, mode)
        };
        this.uniformLocations = {
            projectionMatrix: gl.getUniformLocation(shader_program, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shader_program, 'uModelViewMatrix'),
            uSampler: gl.getUniformLocation(shader_program, 'uSampler')
        };
    }
}

class FlatProgramData extends ProgramData {
    constructor(gl, shader_program) {
        super(gl, shader_program, 'aVertexColor')
    }
}

class TexturedProgramData extends ProgramData {
    constructor(gl, shader_program) {
        super(gl, shader_program, 'aTextureCoord');
    }
}

export { initShaderProgram, ProgramData };

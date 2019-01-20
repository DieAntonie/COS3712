

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
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vTextureCoord = aTextureCoord;

        // Apply lighting effect

        highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(-1, 1, 1));

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);
    }
`;

/**
* Fragment shader program source code.
* @type {String}
*/
const texture_fragment_shader_source = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
        highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

        gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
`;
/**
* Initialize a shader program, so WebGL knows how to draw our data.
* @param {WebGLRenderingContext} gl WebGL rendering context.
* @returns {ProgramData} WebGL program data.
*/
function initShaderProgram(gl) {

    const shader_program_factory = new ShaderProgramFactory(gl);

    const texture_program_data = new TexturedProgramData(gl, shader_program_factory.CreateShaderProgram());

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
            vertexNormal: gl.getAttribLocation(shader_program, 'aVertexNormal'),
            vertexColor: gl.getAttribLocation(shader_program, mode)
        };
        this.uniformLocations = {
            projectionMatrix: gl.getUniformLocation(shader_program, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shader_program, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shader_program, 'uNormalMatrix'),
            uSampler: gl.getUniformLocation(shader_program, 'uSampler')
        };
    }
}

/**
 * Shader Program factory that provides easyt olls for creating Shader programs.
 */
class ShaderProgramFactory {
    /**
     * Instantiates a new Shader program factory.
     * @param {WebGLRenderingContext} web_GL_rendering_context 
     */
    constructor(web_GL_rendering_context) {
        /**
         * @type {WebGLRenderingContext}
         */
        this._web_GL_rendering_context = web_GL_rendering_context;

        /**
         * GLenum indicating the shader is a vertex shader.
         * @type {GLenum}
         */
        this._vertex_shader = web_GL_rendering_context.VERTEX_SHADER;

        /**
         * GLenum indicating the shader is a fragment shader.
         * @type {GLenum}
         */
        this._fragment_shader = web_GL_rendering_context.FRAGMENT_SHADER;

        /**
         * Vertex shader program source code.
         * @type {String}
         */
        this._vertex_shader_source = `
            attribute vec4 aVertexPosition;
            attribute vec3 aVertexNormal;
            attribute vec2 aTextureCoord;

            uniform mat4 uNormalMatrix;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;

            void main(void) {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
                vTextureCoord = aTextureCoord;

                // Apply lighting effect

                highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
                highp vec3 directionalLightColor = vec3(1, 1, 1);
                highp vec3 directionalVector = normalize(vec3(-1, 1, 1));

                highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

                highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
                vLighting = ambientLight + (directionalLightColor * directional);
            }`;

        /**
         * Fragment shader program source code.
         * @type {String}
         */
        this._fragment_shader_source = `
            varying highp vec2 vTextureCoord;
            varying highp vec3 vLighting;

            uniform sampler2D uSampler;

            void main(void) {
                highp vec4 texelColor = texture2D(uSampler, vTextureCoord);

                gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
            }`;
    }

    /**
     * @type {WebGLRenderingContext}
     */
    get web_GL_rendering_context() {
        return this._web_GL_rendering_context;
    }

    /**
     * Returns a GLboolean indicating whether or not the last shader compilation was successful.
     * @type {GLboolean}
     */
    get compile_status() {
        return this.web_GL_rendering_context.COMPILE_STATUS;
    }

    /**
     * Creates a WebGL program object.
     * @returns {WebGLProgram} WebGL program NOT YET combined with two webGL shaders.
     */
    CreateProgram() {
        return this.web_GL_rendering_context.createProgram();
    }

    /**
     * Creates and initializes a WebGL program object.
     * @returns {WebGLProgram} Combination of two compiled WebGL shaders consisting of a vertex shader and a fragment
     * shader.
     */
    CreateShaderProgram() {
        const shader_program = this.CreateProgram();
        this.AttachShader(shader_program, this.LoadVertexShader());
        this.AttachShader(shader_program, this.LoadFragmentShader());
        this.LinkProgram(shader_program);
        return shader_program;
    }

    /**
     * Creates a webGL shader that can then be configured further.
     * @param {GLenum} type Vertex / Fragment shader type. 
     * @returns {WebGLShader}  Vertex / Fragment webGL shader.
     */
    CreateShader(type) {
        return this.web_GL_rendering_context.createShader(type);
    }

    /**
     * Marks a given WebGLShader object for deletion.
     * @param {WebGLShader} shader A WebGLShader object to delete.
     */
    DeleteShader(shader)
    {
        this.web_GL_rendering_context.deleteShader(shader);
    }

    /**
     * Sets the source code of a WebGLShader.
     * @param {WebGLShader} shader A WebGLShader object in which to set the source code.
     * @param {String} source A DOMString containing the GLSL source code to set.
     */
    ShaderSource(shader, source) {
        this.web_GL_rendering_context.shaderSource(shader, source);
    }

    /**
     * Compiles a GLSL shader into binary data so that it can be used by a WebGLProgram.
     * @param {WebGLShader} shader A fragment or vertex WebGL shader.
     */
    CompileShader(shader) {
        this.web_GL_rendering_context.compileShader(shader);
    }

    /**
     * Returns information about the given shader.
     * @param {WebGLShader} shader 
     * @param {GLenum} pname 
     */
    GetShaderParameter(shader, pname) {
        return this.web_GL_rendering_context.getShaderParameter(shader, pname);
    }

    /**
     * Returns the information log for the specified WebGLShader object.
     * @param {WebGLShader} shader A WebGLShader to query.
     * @returns {String} A DOMString that contains diagnostic messages, warning messages, and other information about
     * the last compile operation.
     */
    GetShaderInfoLog(shader) {
        return this.web_GL_rendering_context.getShaderInfoLog(shader);
    }

    /**
     * Creates a shader of the given type, uploads the source and compiles it.
     * @param {GLenum} type Shader type to load.
     * @param {String} source Shader program source code.
     * @returns {WebGLShader} WebGL shader.
     */
    LoadShader(type, source) {
        const shader = this.CreateShader(type);
        this.ShaderSource(shader, source);
        this.CompileShader(shader);
        
        // See if it compiled successfully
        if (!this.GetShaderParameter(shader, this.compile_status)) {
            alert('An error occurred compiling the shaders: ' + this.GetShaderInfoLog(shader));
            this.DeleteShader(shader);
            return null;
        }
        return shader;
    }

    /**
     * Creates a vertex shader, uploads the source and compiles it.
     * @returns {WebGLShader} Compiled vertex shader.
     */
    LoadVertexShader() {
        return this.LoadShader(this._vertex_shader, this._vertex_shader_source);
    }

    /**
     * Creates a fragment webGL shader, uploads the source and compiles it.
     * @returns {WebGLShader} Compiled fragment shader.
     */
    LoadFragmentShader() {
        return this.LoadShader(this._fragment_shader, this._fragment_shader_source);
    }

    /**
     * Attaches either a fragment or vertex WebGLShader to a WebGLProgram.
     * @param {WebGLProgram} program A WebGL program.
     * @param {WebGLShader} shader A fragment or vertex WebGL shader.
     */
    AttachShader(program, shader) {
        this.web_GL_rendering_context.attachShader(program, shader);
    }

    /**
     * Links a given WebGL program to the attached vertex and fragment shaders.
     * @param {WebGLProgram} program A WebGL program to link.
     */
    LinkProgram(program) {
        this.web_GL_rendering_context.linkProgram(program);
    }
}

class FlatProgramData extends ProgramData {
    constructor(gl, shader_program) {
        super(gl, shader_program, 'aVertexColor');
    }
}

class TexturedProgramData extends ProgramData {
    constructor(gl, shader_program) {
        super(gl, shader_program, 'aTextureCoord');
    }
}

export { initShaderProgram, ProgramData };

import {
    BufferedObject
} from './buffers.js';
import {
    LoadTexture
} from './textures.js';

/**
 * Rendering assistance funtionality.
 * @property {WebGLRenderingContext} web_GL_rendering_context
 * @property {WebGLProgram} shader_program
 * @property {BufferedObject} buffered_object
 */
class Renderer {
    /**
     * Instantiate a new Renderer.
     * @param {WebGLRenderingContext} web_GL_rendering_context 
     * @param {WebGLProgram} shader_program 
     * @param {BufferedObject} buffered_object
     */
    constructor(web_GL_rendering_context, shader_program, buffered_object) {
        /**
         * @type {WebGLRenderingContext}
         */
        this._web_GL_rendering_context = web_GL_rendering_context;

        /**
         * @type {WebGLProgram}
         */
        this._shader_program = shader_program;

        /**
         * @type {BufferedObject}
         */
        this._buffered_object = buffered_object;

        /**
         * Perspective matrix, a special matrix that is used to simulate the distortion of perspective in a camera.
         * @type {mat4} 4x4 Matrix.
         */
        this._projection_matrix = mat4.create();

        /**
         * Perspective matrix, a special matrix that is used to simulate the distortion of perspective in a camera.
         * @type {mat4} 4x4 Matrix.
         */
        this._model_view_matrix = mat4.create();

        /**
         * Perspective matrix, a special matrix that is used to simulate the distortion of perspective in a camera.
         * @type {mat4} 4x4 Matrix.
         */
        this._normal_matrix = mat4.create();

        /**
         * Perspective matrix, a special matrix that is used to simulate the distortion of perspective in a camera.
         * @type {Number} 4x4 Matrix.
         */
        this._square_rotation = 0.0;

        /**
         * Perspective matrix, a special matrix that is used to simulate the distortion of perspective in a camera.
         * @type {GLenum} 4x4 Matrix.
         */
        this._float = web_GL_rendering_context.FLOAT;

        /**
         * Buffer containing vertex attributes, such as vertex coordinates, texture coordinate data, or vertex color
         * data.
         * @type {GLenum}
         */
        this._array_buffer = web_GL_rendering_context.ARRAY_BUFFER;

        /**
         * Buffer used for element indices.
         * @type {GLenum}
         */
        this._element_array_buffer = web_GL_rendering_context.ELEMENT_ARRAY_BUFFER;

        /**
         * The texture unit to make active.
         * @type {WebGLTexture}
         */
        this._texture = LoadTexture(web_GL_rendering_context, './power_of_two_hd.jpg');

        /**
         * The texture unit to make active.
         * @type {GLenum}
         */
        this._texture_0 = web_GL_rendering_context.TEXTURE0;

        /**
         * A GLenum specifying the two-dimensional texture binding point (target).
         * @type {GLenum}
         */
        this._texture_2D = web_GL_rendering_context.TEXTURE_2D;

        mat4.perspective(
            this._projection_matrix,
            this.field_of_view,
            this.aspect,
            this.zNear,
            this.zFar
        );
        
        // Now move the drawing position a bit to where we want to
        // start drawing the square.
        mat4.translate(
            this._model_view_matrix,    // destination matrix
            this._model_view_matrix,    // matrix to translate
            [-0.0, 0.0, -6.0]           // amount to translate
        );  

        mat4.invert(this._normal_matrix, this._model_view_matrix);
        mat4.transpose(this._normal_matrix, this._normal_matrix);
    }

    /**
     * @type {WebGLRenderingContext}
     */
    get web_GL_rendering_context() {
        return this._web_GL_rendering_context;
    }

    /**
     * @type {WebGLProgram}
     */
    get shader_program() {
        return this._shader_program;
    }

    /**
     * @type {BufferedObject}
     */
    get buffered_object() {
        return this._buffered_object;
    }

    /**
     * Field of view is 45 degrees in radians.
     * @type {Number} Degrees in radians.
     */
    get field_of_view() {
        return 45 * Math.PI / 180;
    }

    /**
     * Ratio that matches the display size of the canvas.
     * @type {Number} width/height 
     */
    get aspect() {
        return this.web_GL_rendering_context.canvas.clientWidth /
            this.web_GL_rendering_context.canvas.clientHeight;;
    }

    /**
     * Minimum visibility threshold.
     * @type {Number}
     */
    get zNear() {
        return 0.1;
    }

    /**
     * Maximum visibility threshold.
     * @type {Number}
     */
    get zFar() {
        return 100.0;
    }

    /**
     * Returns the location of an attribute variable in a given WebGLProgram.
     * @param {WebGLProgram} program A WebGLProgram containing the attribute variable.
     * @param {String} name A DOMString specifying the name of the attribute variable whose location to get.
     * @returns {GLint} A GLint number indicating the location of the variable name if found.
     */
    GetAttribLocation(program, name) {
        return this._web_GL_rendering_context.getAttribLocation(program, name);
    }

    /**
     * Returns the location of a specific uniform variable which is part of a given WebGLProgram.
     * @param {WebGLProgram} program The WebGLProgram in which to locate the specified uniform variable.
     * @param {String} name A DOMString specifying the name of the uniform variable whose location is to be returned.
     * @returns {WebGLUniformLocation} A WebGLUniformLocation value indicating the location of the named variable,
     * if it exists.
     */
    GetUniformLocation(program, name) {
        return this._web_GL_rendering_context.getUniformLocation(program, name);
    }

    /**
     * Binds the buffer currently bound to the ARRAY_BUFFER to a generic vertex attribute of the current vertex buffer
     * object and specifies its layout.
     * @param {GLuint} index A GLuint specifying the index of the vertex attribute that is to be modified.
     * @param {GLint} size A GLint specifying the number of components per vertex attribute. Must be 1, 2, 3, or 4.
     * @param {GLenum} [type] A GLenum specifying the data type of each component in the array.
     * @param {GLboolean} [normalized] A GLboolean specifying whether integer data values should be normalized into a
     * certain range when being casted to a float.
     * @param {GLsizei} [stride] A GLsizei specifying the offset in bytes between the beginning of consecutive vertex
     * attributes.
     * @param {GLintptr} [offset] A GLintptr specifying an offset in bytes of the first component in the vertex
     * attribute array.
     */
    VertexAttribPointer(index, size, type = this._float, normalized = false, stride = 0, offset = 0) {
        this.web_GL_rendering_context.vertexAttribPointer(index, size, type, normalized, stride, offset);
    }

    /**
     * Turns on the generic vertex attribute array at the specified index into the list of attribute arrays.
     * @param {GLuint} index A GLuint specifying the index number that uniquely identifies the vertex attribute to enable.
     */
    EnableVertexAttribArray(index) {
        this.web_GL_rendering_context.enableVertexAttribArray(index)
    }

    /**
     * Specifies which texture unit to make active.
     * @param {GLenum} texture The texture unit to make active.
     */
    ActiveTexture(texture) {
        this.web_GL_rendering_context.activeTexture(texture);
    }

    /**
     * Binds a given WebGLTexture to a target (binding point).
     * @param {GLenum} target A GLenum specifying the binding point (target).
     * @param {WebGLTexture} texture A WebGLTexture object to bind.
     */
    BindTexture(target, texture) {
        this.web_GL_rendering_context.bindTexture(target, texture);
    }

    /**
     * Specify values of uniform variables.
     * @param {WebGLUniformLocation} location A WebGLUniformLocation object containing the location of the uniform
     * attribute to modify.
     * @param {Number} x An integer Number for integer values.
     */
    Uniform1i(location, x) {
        this.web_GL_rendering_context.uniform1i(location, x);
    }

    /**
     * Specify matrix values for uniform variables.
     * @param {WebGLUniformLocation} location A WebGLUniformLocation object containing the location of the uniform
     * attribute to modify.
     * @param {GLboolean} transpose A GLboolean specifying whether to transpose the matrix.
     * @param {Float32Array} value A Float32Array or sequence of GLfloat values.
     */
    UniformMatrix4fv(location, transpose, value) {
        this.web_GL_rendering_context.uniformMatrix4fv(location, transpose, value);
    }

    /**
     * Renders primitives from array data.
     * @param {GLenum} mode A GLenum specifying the type primitive to render.
     * @param {GLsizei} count A GLsizei specifying the number of elements to be rendered.
     * @param {GLenum} type A GLenum specifying the type of the values in the element array buffer.
     * @param {GLintptr} offset A GLintptr specifying a byte offset in the element array buffer.
     */
    DrawElements(mode, count, type, offset) {
        this.web_GL_rendering_context.drawElements(mode, count, type, offset);
    }

    ClearScreen() {
        this.web_GL_rendering_context.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        this.web_GL_rendering_context.clearDepth(1.0);                 // Clear everything
        this.web_GL_rendering_context.enable(gl.DEPTH_TEST);           // Enable depth testing
        this.web_GL_rendering_context.depthFunc(gl.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.
        this.web_GL_rendering_context.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    /**
     * Binds a given WebGLBuffer to a target.
     * @param {GLenum} target A GLenum specifying the binding point (target).
     * @param {WebGLBuffer} buffer A WebGLBuffer to bind.
     */
    BindBuffer(target, buffer) {
        this.web_GL_rendering_context.bindBuffer(target, buffer);
    }

    /**
     * Specify in what order the attributes are stored, and what data type they are in.
     * @param {WebGLBuffer} buffer A WebGLBuffer to bind.
     * @param {GLuint} index A GLuint specifying the index of the vertex attribute that is to be modified.
     * @param {GLint} size A GLint specifying the number of components per vertex attribute. Must be 1, 2, 3, or 4.
     */
    BufferAttribute(buffer, index, size) {
        this.BindBuffer(this._array_buffer, buffer);
        this.VertexAttribPointer(index, size);
        this.EnableVertexAttribArray(index);
    }

    ApplyTexture(texture) {
        this.ActiveTexture(this._texture_0);
        this.BindTexture(this._texture_2D, this._texture);
    }

    Render() {
        ClearScreen();
        this.BufferAttribute(
            this.buffered_object.position,
            this.GetAttribLocation(this.shader_program, 'aVertexPosition'),
            3
        );
        this.BufferAttribute(
            this.buffered_object.fill,
            this.GetAttribLocation(this.shader_program, 'aTextureCoord'),
            2
        );
        this.BufferAttribute(
            this.buffered_object.normal,
            this.GetAttribLocation(this.shader_program, 'aVertexNormal'),
            3
        );
        this.web_GL_rendering_context.useProgram(this.shader_program);

        
    }
    
}

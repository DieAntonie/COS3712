import {
    BufferedObject
} from './buffers.js'

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
     * @param {GLenum} type A GLenum specifying the data type of each component in the array.
     * @param {GLboolean} normalized A GLboolean specifying whether integer data values should be normalized into a
     * certain range when being casted to a float.
     * @param {GLsizei} stride A GLsizei specifying the offset in bytes between the beginning of consecutive vertex
     * attributes.
     * @param {GLintptr} offset A GLintptr specifying an offset in bytes of the first component in the vertex
     * attribute array.
     */
    VertexAttribPointer(index, size, type, normalized, stride, offset) {
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
}

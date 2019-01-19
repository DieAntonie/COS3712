import {
    cube_data
} from './cube.js';

import {
    positions as square_positions,
    colors as square_colors
} from './square.js';

/**
 * Create buffer.
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 * @returns {BufferData} Complex object.
 */
function initBuffers(gl) {

    const buffer_factory = new BufferFactory(gl);

    return new BufferData({
        square_buffers: {
            position: buffer_factory.CreateAttributeBuffer(square_positions),
            color: buffer_factory.CreateAttributeBuffer(square_colors),
        },
        cube_buffers: {
            position: buffer_factory.CreateAttributeBuffer(cube_data.positions),
            color: buffer_factory.CreateAttributeBuffer(cube_data.colors),
            texture: buffer_factory.CreateAttributeBuffer(cube_data.textures),
            normals: buffer_factory.CreateAttributeBuffer(cube_data.normals),
            indices: buffer_factory.CreateIndexBuffer(cube_data.indices)
        }
    });
}

/**
 * A Buffer factory that provides easy tools for creating WebGLBuffers.
 */
class BufferFactory {
    /**
     * Instatiate a Buffer Factory.
     * @param {WebGLRenderingContext} web_GL_rendering_context An interface to the OpenGL ES 2.0 graphics rendering.
     * context for the drawing surface of an HTML <canvas> element.
     */
    constructor(web_GL_rendering_context) {
        /**
         * An interface to the OpenGL ES 2.0 graphics rendering.
         * @type {WebGLRenderingContext} 
         */
        this._web_GL_rendering_context = web_GL_rendering_context;

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
         * Contents of the buffer are likely to be used often and not change often.
         * @type {GLenum}
         */
        this._static_draw = web_GL_rendering_context.STATIC_DRAW;
    }

    /**
     * An interface to the OpenGL ES 2.0 graphics rendering.
     * @type {WebGLRenderingContext} 
     */
    get web_GL_rendering_context()
    {
        return this._web_GL_rendering_context;
    }

    /**
     * Creates and Initializes a WebGLBuffer storing data such as vertices or colors.
     * @returns {WebGLBuffer} The WebGLBuffer object does not define any methods or properties of its own and its
     * content is not directly accessible.
     */
    CreateBuffer() {
        return this._web_GL_rendering_context.createBuffer();
    }

    /**
     * Creates, Binds and Buffers a WebGLBuffer storing data such as vertex attributes.
     * @param {Number[]} data Data that will be copied into the data store.
     * @returns {WebGLBuffer} The WebGLBuffer object does not define any methods or properties of its own and its
     * content is not directly accessible.
     */
    CreateAttributeBuffer(data) {
        const attribute_buffer = this.CreateBuffer();
        this.BufferAttributeData(attribute_buffer, data);
        return attribute_buffer;
    }

    /**
     * Creates, Binds and Buffers a WebGLBuffer storing data such as element indices.
     * @param {Number[]} data Data that will be copied into the data store.
     * @returns {WebGLBuffer} The WebGLBuffer object does not define any methods or properties of its own and its
     * content is not directly accessible.
     */
    CreateIndexBuffer(data) {
        const index_buffer = this.CreateBuffer();
        this.BufferIndexData(index_buffer, data);
        return index_buffer;
    }

    /**
     * Binds a given WebGLBuffer to a target.
     * @param {GLenum} target A GLenum specifying the binding point (target).
     * @param {WebGLBuffer} buffer A WebGLBuffer to bind.
     */
    BindBuffer(target, buffer) {
        this._web_GL_rendering_context.bindBuffer(target, buffer);
    }

    /**
     * Binds a given Vertex atribute WebGLBuffer.
     * @param {WebGLBuffer} buffer A WebGLBuffer to bind.
     */
    BindAttributeBuffer(buffer) {
        this.BindBuffer(this._array_buffer, buffer);
    }

    /**
     * Binds a given Element index WebGLBuffer.
     * @param {WebGLBuffer} buffer A WebGLBuffer to bind.
     */
    BindIndexBuffer(buffer) {
        this.BindBuffer(this._element_array_buffer, buffer);
    }
    
    /**
     * Initializes and creates the buffer object's data store.
     * @param {GLenum} target A GLenum specifying the binding point (target).
     * @param {ArrayBufferView} src_data Array that will be copied into the data store.
     * @param {GLenum} usage A GLenum specifying the usage pattern of the datastore.
     */
    BufferData(target, src_data , usage) {
        this._web_GL_rendering_context.bufferData(target, src_data, usage);
    }
    
    /**
     * Initializes and creates the buffer object's vertex attribute data store.
     * @param {WebGLBuffer} buffer A Atribute WebGLBuffer to buffer.
     * @param {ArrayBufferView} src_data Array that will be copied into the data store.
     */
    BufferAttributeData(buffer, src_data) {
        this.BindAttributeBuffer(buffer);
        this.BufferData(this._array_buffer, new Float32Array(src_data), this._static_draw);
    }
    
    /**
     * Initializes and creates the buffer object's element index data store.
     * @param {WebGLBuffer} buffer A Index WebGLBuffer to buffer.
     * @param {ArrayBufferView} src_data Array that will be copied into the data store.
     */
    BufferIndexData(buffer, src_data) {
        this.BindIndexBuffer(buffer);
        this.BufferData(this._element_array_buffer, new Uint16Array(src_data), this._static_draw);
    }
}

class BufferData {
    constructor(obj) {
        this.square_buffers = {
            position: obj.square_buffers.position,
            color: obj.square_buffers.color,
        };
        this.cube_buffers = {
            position: obj.cube_buffers.position,
            color: obj.cube_buffers.color,
            texture: obj.cube_buffers.texture,
            normals: obj.cube_buffers.normals,
            indices: obj.cube_buffers.indices
        };
    }
}

export { initBuffers, BufferData };

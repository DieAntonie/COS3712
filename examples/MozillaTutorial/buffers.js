
/**
 * A Buffer factory that provides easy tools for creating, binding and buffering WebGLBuffers.
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
    get web_GL_rendering_context() {
        return this._web_GL_rendering_context;
    }

    /**
     * Creates and Initializes a WebGLBuffer storing data such as vertices or colors.
     * @returns {WebGLBuffer} The WebGLBuffer object does not define any methods or properties of its own and its
     * content is not directly accessible.
     */
    CreateBuffer() {
        return this.web_GL_rendering_context.createBuffer();
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
        this.web_GL_rendering_context.bindBuffer(target, buffer);
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
    BufferData(target, src_data, usage) {
        this.web_GL_rendering_context.bufferData(target, src_data, usage);
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

    /**
     * Create a Buffered Object from an structured collection of object data.
     * @param {{position: Number[], normal: Number[], fill: Number[], index: Number[]}} object_data Object data to buffer
     */
    BufferObject(object_data) {
        const buffered_object = new BufferedObject(
            this.web_GL_rendering_context,
            object_data.position ? this.CreateAttributeBuffer(object_data.position) : undefined,
            object_data.fill ? this.CreateAttributeBuffer(object_data.fill) : undefined,
            object_data.normal ? this.CreateAttributeBuffer(object_data.normal) : undefined,
            object_data.index ? this.CreateIndexBuffer(object_data.index) : undefined
        );
        return buffered_object;
    }
}

/**
 * Object with buffered properties.
 * @param {WebGLBuffer} position Positions of the objects vertices.
 * @param {WebGLBuffer} fill Objects fill medium buffer.
 * @param {WebGLBuffer} normal Surface normals for each vertex.
 * @param {WebGLBuffer} index Indices of the objects vertices.
 */
class BufferedObject {
    /**
     * Instantiate a new buffered object.
     * @param {WebGLRenderingContext} web_GL_rendering_context An interface to the OpenGL ES 2.0 graphics rendering.
     * context for the drawing surface of an HTML <canvas> element.
     * @param {WebGLBuffer} [position] Positions of the objects vertices.
     * @param {WebGLBuffer} [fill] Objects fill medium buffer.
     * @param {WebGLBuffer} [normal] Surface normals for each vertex.
     * @param {WebGLBuffer} [index] Indices of the objects vertices.
     */
    constructor(web_GL_rendering_context, position, fill, normal, index) {
        /**
         * An interface to the OpenGL ES 2.0 graphics rendering.
         * @type {WebGLRenderingContext} 
         */
        this._web_GL_rendering_context = web_GL_rendering_context;

        /**
         * Positions of the objects vertices.
         * @type {WebGLBuffer}
         */
        this._position = position || web_GL_rendering_context.createBuffer();

        /**
         * Objects fill medium buffer.
         * @type {WebGLBuffer}
         */
        this._fill = fill || web_GL_rendering_context.createBuffer();

        /**
         * Surface normals for each vertex.
         * @type {WebGLBuffer}
         */
        this._normal = normal || web_GL_rendering_context.createBuffer();

        /**
         * Indices of the objects vertices.
         * @type {WebGLBuffer}
         */
        this._index = index || web_GL_rendering_context.createBuffer();
    }

    /**
     * Positions of the objects vertices.
     * @type {WebGLBuffer}
     */
    get position() {
        return this._position;
    }

    /**
     * Objects fill medium buffer.
     * @type {WebGLBuffer}
     */
    get fill() {
        return this._fill;
    }

    /**
     * Surface normals for each vertex.
     * @type {WebGLBuffer}
     */
    get normal() {
        return this._normal;
    }

    /**
     * Indices of the objects vertices.
     * @type {WebGLBuffer}
     */
    get index() {
        return this._index;
    }
}

export { BufferFactory, BufferedObject };

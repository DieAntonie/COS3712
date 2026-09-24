
/**
 * Initialize a texture and load an image. When the image finished loading copy it into the texture.
 * @param {WebGLRenderingContext} gl WebGL rendering context.
 * @param {URL} url Location of Texture resource.
 * @returns {WebGLTexture} WebGL texture. 
 */
function LoadTexture(gl, url) {
    /**
     * A WebGLTexture object to bind.
     * @type {WebGLTexture}
     */
    const texture = gl.createTexture();

    /**
     * A GLenum specifying the binding point (target) of the active texture.
     * @type {GLenum} A two-dimensional texture.
     */
    const target = gl.TEXTURE_2D;

    /**
     * A GLint specifying the level of detail. Level 0 is the base image level.
     * @type {GLint} Number.
     */
    const level = 0;

    /**
     * A GLenum specifying the color components in the texture.
     * @type {GLenum} Red, green, blue and alpha components are read from the color buffer.
     */
    const internalformat = gl.RGBA;

    /**
     * A GLsizei specifying the width of the texture.
     * @type {GLsizei} Number.
     */
    const width = 1;

    /**
     * A GLsizei specifying the height of the texture.
     * @type {GLsizei} Number.
     */
    const height = 1;

    /**
     * A GLint specifying the width of the border. Must be 0.
     * @type {GLint} Number.
     */
    const border = 0;

    /**
     * A GLenum specifying the format of the texel data.
     * @type {GLenum} Red, green, blue and alpha components are read from the color buffer.
     */
    const format = gl.RGBA;

    /**
     * A GLenum specifying the data type of the texel data.
     * @type {GLenum} 8 bits per channel for gl.RGBA
     */
    const type = gl.UNSIGNED_BYTE;

    /**
     * A pixel source for the texture.
     * @type {Uint8Array} Opaque GREEN.
     */
    const pixels = new Uint8Array([0, 255, 0, 255]);

    /**
     * The HTMLImageElement interface provides special properties and methods for manipulating `<img>` elements.
     * @type {HTMLImageElement}
     */
    const image = new Image();

    // Binds a given WebGLTexture to a target.
    gl.bindTexture(
        target,
        texture
    );

    // Specifies an initial two-dimensional texture image.
    gl.texImage2D(
        target,
        level,          
        internalformat,
        width,
        height,
        border,
        format,
        type,
        pixels
    );

    // EventHandler that processes load events.
    image.onload = () => {
        // Binds a given WebGLTexture to a target.
        gl.bindTexture(
            target,
            texture
        );

        // Specifies a two-dimensional texture image.
        gl.texImage2D(
            target,
            level,
            internalformat,
            format,
            type,
            image
        );

        /**
         * Evaluates whether the given `value` is a power of 2.
         * @param {Number} value Value in 2^n.
         */
        const isPowerOf2 = (value) => (value != 0 && ((value & (value - 1)) == 0));

        // Check if the image is a power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Generates a set of mipmaps for a WebGLTexture object.
            gl.generateMipmap(target);
        } else {
            /**
             * Wrapping function for texture coordinate s.
             * @type {GLenum}
             */
            const texture_wrap_s = gl.TEXTURE_WRAP_S;
            
            /**
             * Wrapping function for texture coordinate t.
             * @type {GLenum}
             */
            const texture_wrap_t = gl.TEXTURE_WRAP_T;
            
            /**
             * Turn off mips and set wrapping to clamp to edge
             * @type {GLenum}
             */
            const clamp_to_edge = gl.CLAMP_TO_EDGE;
            
            /**
             * Texture minification filter.
             * @type {GLenum}
             */
            const texture_min_filter = gl.TEXTURE_MIN_FILTER;

            /**
             * Texture minification filter method.
             * @type {GLenum}
             */
            const linear = gl.LINEAR;
            
            // Set texture parameters.
            gl.texParameteri(target, texture_wrap_s, clamp_to_edge);
            gl.texParameteri(target, texture_wrap_t, clamp_to_edge);
            gl.texParameteri(target, texture_min_filter, linear);
        }
    };
    image.src = url;

    return texture;
}

export { LoadTexture };

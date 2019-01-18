import {
    positions as cube_positions,
    colors as cube_colors,
    indices as cube_indices,
    texture as cube_texture,
    normals as cube_normal
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

    /**
     * Populate buffer with data.
     * @param {Number} target Targeted Buffer type.
     * @param {WebGLBuffer} webGLBuffer Web GL buffer.
     * @param {Float32Array|Uint16Array} bufferData Buffer data.
     */
    function populateBuffer(target, webGLBuffer, bufferData) {

        // Select the buffer to apply buffer operations to from here out.
        gl.bindBuffer(target, webGLBuffer);

        // Fill the current buffer.
        gl.bufferData(target, bufferData, gl.STATIC_DRAW);
    }

    /**
     * Populate element buffer with data.
     * @param {WebGLBuffer} webGLBuffer Web GL buffer.
     * @param {Number[]} bufferData Buffer data.
     */
    function populateElementBuffer(webGLBuffer, bufferData) {
        populateBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLBuffer, new Uint16Array(bufferData))
    }

    /**
     * Populate array buffer with data.
     * @param {WebGLBuffer} webGLBuffer Web GL buffer.
     * @param {Number[]} bufferData Buffer data.
     */
    function populateArrayBuffer(webGLBuffer, bufferData) {
        populateBuffer(gl.ARRAY_BUFFER, webGLBuffer, new Float32Array(bufferData))
    }

    /**
     * Buffer to store the vertex positions.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const square_positionBuffer = gl.createBuffer();

    /**
     * Buffer to store the vertex colors.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const square_colorBuffer = gl.createBuffer();

    // Populate position buffer with position data.
    populateArrayBuffer(square_positionBuffer, square_positions);

    // Populate color buffer with color data.
    populateArrayBuffer(square_colorBuffer, square_colors);

    /**
     * Buffer to store the vertex positions of a cube.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const cube_positionBuffer = gl.createBuffer();

    /**
     * Buffer to store the vertex colors of a cube.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const cube_colorBuffer = gl.createBuffer();

    /**
     * Buffer to store the vertex colors of a cube.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const cube_textureBuffer = gl.createBuffer();

    /**
     * Buffer to store the vertex colors of a cube.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const cube_normalBuffer = gl.createBuffer();

    /**
     * Buffer to store the element of a cube.
     * @type {WebGLBuffer} WebGL buffer.
     */
    const cube_indexBuffer = gl.createBuffer();

    // Populate position buffer with position data.
    populateArrayBuffer(cube_positionBuffer, cube_positions);

    // Populate color buffer with color data.
    populateArrayBuffer(cube_colorBuffer, cube_colors);

    // Populate color buffer with color data.
    populateArrayBuffer(cube_textureBuffer, cube_texture);

    // Populate color buffer with color data.
    populateArrayBuffer(cube_normalBuffer, cube_normal);

    // Populate element buffer with element data.
    populateElementBuffer(cube_indexBuffer, cube_indices);

    return new BufferData({
        square_buffers: {
            position: square_positionBuffer,
            color: square_colorBuffer,
        },
        cube_buffers: {
            position: cube_positionBuffer,
            color: cube_colorBuffer,
            texture: cube_textureBuffer,
            indices: cube_indexBuffer,
            normals: cube_normalBuffer
        }
    });
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
    };
};

export { initBuffers, BufferData };

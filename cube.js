/**
 * Cube object to be rendered.
 * @property {Number[]} positions Positions of the cube's vertices.
 * @property {Number[]} indices Triagle definitions of the cube faces.
 * @property {Number[]} colors Color codes of the cube's faces.
 * @property {Number[]} textures Texture mapping for cube's faces.
 * @property {Number[]} normals Normals perpendicular to the Cube's face vertices.
 */
class CubeObject {
    /**
     * Instantiate a `CubeObject`.
     * @param {Number[]} positions Positions of the cube's vertices.
     * @param {Number[]} indices Triagle definitions of the cube faces.
     * @param {Number[]} colors Color codes of the cube's faces.
     * @param {Number[]} textures Texture mapping for cube's faces.
     * @param {Number[]} normals Normals perpendicular to the Cube's face vertices.
     */
    constructor(positions, indices, colors, textures, normals) {
        /**
         * Positions of the cube's vertices.
         * @type {Number[]}
         */
        this._positions = positions;

        /**
         * Triagle definitions of the cube faces.
         * @type {Number[]}
         */
        this._indices = indices;

        /**
         * Color codes of the cube's faces.
         * @type {Number[]}
         */
        this._colors = colors;

        /**
         * Texture mapping for cube's faces.
         * @type {Number[]}
         */
        this._textures = textures;

        /**
         * Normals perpendicular to the Cube's face vertices.
         * @type {Number[]}
         */
        this._normals = normals;
    }
    /**
     * Positions of the cube's vertices.
     * @type {Number[]}
     */
    get positions() {
        return this._positions;
    }

    /**
     * Triagle definitions of the cube faces.
     * @type {Number[]}
     */
    get indices() {
        return this._indices;
    }

    /**
     * Color codes of the cube's faces.
     * @type {Number[]}
     */
    get colors() {
        return this._colors;
    }

    /**
     * Texture mapping for cube's faces.
     * @type {Number[]}
     */
    get textures() {
        return this._textures;
    }

    /**
     * Normals perpendicular to the Cube's face vertices.
     * @type {Number[]}
     */
    get normals() {
        return this._normals;
    }
}

/**
 * Positions of the cube's vertices.
 * @type {Number[]}
 */
const positions = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
];

/**
 * Colors of the Cube's vertices.
 * @type {Number[]}
 */
const colors = function GenerateColors() {
    /**
     * Duplicates "an array" "n times" within itself.
     * @param {Number[]} an_array 
     * @param {Number} n_times 
     * @returns {Number[]} Array(n_times)
     */
    function Duplicate(an_array, n_times) {
        let n_array = Array(n_times).fill(null);
        return n_array.reduce(accumulated_array => accumulated_array.concat(an_array), []);
    }

    /**
     * Structured array of color matices per face of cube.
     * @type {Number[][]}
     */
    const face_colors = [
        [1.0, 1.0, 1.0, 1.0],    // Front face: white
        [1.0, 0.0, 0.0, 1.0],    // Back face: red
        [0.0, 1.0, 0.0, 1.0],    // Top face: green
        [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
        [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
        [1.0, 0.0, 1.0, 1.0],    // Left face: purple
    ];

    // Reduces the array of "face colors" into a single table for all the vertices.
    return face_colors.reduce((accumulated_colors, a_face_color) => {
        // Repeat each color four times for the four vertices of the face
        const duplicated_face_color = Duplicate(a_face_color, 4);
        return accumulated_colors.concat(duplicated_face_color);
    }, []);
}();

/**
 * This array defines each face as two triangles, using the indices into the vertex array to specify each triangle's
 * position.
 * @type {Number[]}
 */
const indices = [
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // back
    8, 9, 10, 8, 10, 11,   // top
    12, 13, 14, 12, 14, 15,   // bottom
    16, 17, 18, 16, 18, 19,   // right
    20, 21, 22, 20, 22, 23,   // left
];

/**
 * The texture coordinates corresponding to each vertex of each face.
 * @type {Number[]}
 */
const texture = [
    // Front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Back
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Top
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Bottom
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Right
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    // Left
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
];

/**
 * Surface normals for each vertex. This is a vector that's perpendicular to the face at that vertex.
 * @type {Number[]}
 */
const normals = [
    // Front
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,
    0.0, 0.0, 1.0,

    // Back
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,
    0.0, 0.0, -1.0,

    // Top
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 1.0, 0.0,

    // Bottom
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,
    0.0, -1.0, 0.0,

    // Right
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,
    1.0, 0.0, 0.0,

    // Left
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0,
    -1.0, 0.0, 0.0
];

const cube_object = new CubeObject(positions, indices, colors, texture, normals);

export {
    cube_object
};

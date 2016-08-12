"use strict";

var GLMatrix = require("gl-matrix");

class Cube {
    /**
     * Creates a new cube object
     * @param {WebGLRenderingContext} gl
     * @param {number} size
     * @param {number[]} position
     * @param {Float32Array} color
     * @param {WebGLTexture|null} texture
     */
    constructor (gl, size, position, color, texture) {
        if (!gl || !gl.createBuffer) {
            throw new TypeError("Invalid rendering context provided to new Cube().");
        }

        if (typeof size !== "number" || size <= 0) {
            throw new TypeError("Invalid size provided to new Cube().");
        }

        if (!Array.isArray(position) || position.length != 3) {
            throw new TypeError("Invalid position provided to new Cube().");
        }

        if (Object.prototype.toString.call(color) !== "[object Float32Array]" || color.length != 4) {
            throw new TypeError("Invalid color provided to new Cube().");
        }

        /**
         * @type {WebGLBuffer}
         */
        this.vertexBuffer = gl.createBuffer();

        /**
         * @type {WebGLBuffer}
         */
        this.indexBuffer = gl.createBuffer();

        /**
         * @type {Float32Array}
         */
        this.vertexArray = new Float32Array([
            //front
            -1, 1, 1,
            1, 1, 1,
            -1, -1, 1,
            1, -1, 1,

            //right
            1, 1, -1,
            1, 1, 1,
            1, -1, -1,
            1, -1, 1,

            // left
            -1, 1, -1,
            -1, 1, 1,
            -1, -1, -1,
            -1, -1, 1,

            //back
            1, 1, -1,
            -1, 1, -1,
            1, -1, -1,
            -1, -1, -1,

            //top
            1, 1, -1,
            -1, 1, -1,
            1, 1, 1,
            -1, 1, 1,

            //bottom
            1, -1, -1,
            -1, -1, -1,
            1, -1, 1,
            -1, -1, 1,
        ]);

        /**
         * @type {number} vertexSize The number of items per vertex in the vertexArray
         */
        this.vertexSize = 3;

        /**
         * @type {Uint16Array}
         */
        this.indexArray = new Uint16Array([
            0, 1, 2, 1, 2, 3, //front
            4, 5, 6, 5, 6, 7, //right
            8, 9, 10, 9, 10, 11, //left
            12, 13, 14, 13, 14, 15, //back
            16, 17, 18, 17, 18, 19, //top
            20, 21, 22, 21, 22, 23, //bottom
        ]);

        /**
         * @type {number[]} position The position of this object relative to its origin (from its parent)
         */
        this.position = position;

        /**
         * @type {{x: number,y: number,z: number}} rotation The rotation around each axis
         */
        this.rotation = {
            x: 0,
            y: 0,
            z: 0,
        };

        /**
         * @type {Float32Array} The color of the whole primitive
         */
        this.color = color;

        /**
         * @type {WebGLTexture|null}
         */
        this.texture = texture || null;

        /**
         * @type {WebGLBuffer|null}
         */
        this.textureCoordinateBuffer = null;

        /**
         * @type {Float32Array|null}
         */
        this.textureCoordinateArray = null;

        /**
         * @type {number} textureCoordinateSize The number of items per texture coordinate in the textureCoordinateArray
         */
        this.textureCoordinateSize = 2;

        this.textureCoordinateBuffer = gl.createBuffer();

        this.textureCoordinateArray = new Float32Array([
            //front
            0, 1,
            1, 1,
            0, 0,
            1, 0,

            //right
            1, 0,
            1, 1,
            0, 0,
            0, 1,

            // left
            1, 0,
            1, 1,
            0, 0,
            0, 1,

            //back
            1, 1,
            0, 1,
            1, 0,
            0, 0,

            //top
            1, 0,
            0, 0,
            1, 1,
            0, 1,

            //bottom
            1, 0,
            0, 0,
            1, 1,
            0, 1,
        ]);

        // Fill the buffers with the initial position
        this.bufferData(gl);
    }

    /**
     * Pushes the vertex and index arrays into the vertex and index buffers
     * Should be called after modifying the arrays
     * @param {WebGLRenderingContext} gl
     */
    bufferData(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexArray, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordinateBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.textureCoordinateArray, gl.STATIC_DRAW);
    }

    /**
     * Pushes data down to the given vertexPosition attribute and mvMatrix uniform, then tell the shader to render
     * This function is meant to be called often.
     * @param {WebGLRenderingContext} gl
     * @param {Float32Array} originMatrix The origin mvMatrix that this primitive is relative to. Should be the identity if there is no parent.
     * @param {Object.<string, number>} vertexAttributes
     * @param {Object.<string, number>} vertexUniforms
     * @param {Object.<string, number>} fragmentUniforms
     */
    render(gl, originMatrix, vertexAttributes, vertexUniforms, fragmentUniforms) {
        var modelViewMatrix = GLMatrix.mat4.clone(originMatrix);
        GLMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, this.position);
        GLMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation.x, [1, 0, 0]);
        GLMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation.y, [0, 1, 0]);
        GLMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation.z, [0, 0, 1]);

        gl.uniformMatrix4fv(vertexUniforms.modelViewMatrix, false, modelViewMatrix);
        gl.uniform4fv(fragmentUniforms.inputColor, this.color);

        if (gl.isTexture(this.texture)) {
            gl.uniform1i(fragmentUniforms.sampler, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureCoordinateBuffer);
        gl.vertexAttribPointer(vertexAttributes.textureCoordinate, this.textureCoordinateSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(vertexAttributes.vertexPosition, this.vertexSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.drawElements(gl.TRIANGLES, this.indexArray.length, gl.UNSIGNED_SHORT, 0);
    }

    animate(dt) {
        this.rotation.x += this.color[0]*(Math.PI/2) * (dt/1000);
        this.rotation.y += this.color[0]*(Math.PI/2) * (dt/1000);
        this.rotation.z += this.color[0]*(Math.PI/2) * (dt/1000);
    }
}

module.exports = Cube;

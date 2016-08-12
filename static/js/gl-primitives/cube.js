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
         * @type {number} rotation The rotation around the rotation axis
         */
        this.rotation = 0;

        /**
         * @type {Float32Array} The color of the whole primitive
         */
        this.color = color;

        /**
         * @type {WebGLTexture|null}
         */
        this.texture = null;

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

        if (this.texture !== null && gl.isTexture(this.texture)) {
        }
    }

    /**
     * Pushes data down to the given vertexPosition attribute and mvMatrix uniform, then tell the shader to render
     * This function is meant to be called often.
     * @param {WebGLRenderingContext} gl
     * @param {Float32Array} originMatrix The origin mvMatrix that this primitive is relative to. Should be the identity if there is no parent.
     * @param {number} vertexPositionAttribute The index of the vertexPositionAttribute
     * @param {number} modelViewMatrixUniform The index of the modelViewMatrixUniform
     * @param {number} inputColorUniform The index of the inputColorUniform
     */
    render(gl, originMatrix, vertexPositionAttribute, modelViewMatrixUniform, inputColorUniform) {
        var modelViewMatrix = GLMatrix.mat4.clone(originMatrix);
        GLMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, this.position);
        GLMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation, [1, 3, 1]);

        gl.uniformMatrix4fv(modelViewMatrixUniform, false, modelViewMatrix);

        gl.uniform4fv(inputColorUniform, this.color);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, this.vertexSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.drawElements(gl.TRIANGLES, this.indexArray.length, gl.UNSIGNED_SHORT, 0);
    }

    animate(dt) {
        this.rotation += (Math.PI/2) * (dt/1000);
    }
}

module.exports = Cube;

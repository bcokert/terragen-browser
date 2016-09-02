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
     * @param {InputManager} inputManager
     */
    constructor(gl, size, position, color, texture, inputManager) {
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
            -1, -1, 1
        ]);

        /**
         * @type {Uint16Array}
         */
        this.indexArray = new Uint16Array([
            0, 1, 2, 1, 2, 3, //front
            4, 5, 6, 5, 6, 7, //right
            8, 9, 10, 9, 10, 11, //left
            12, 13, 14, 13, 14, 15, //back
            16, 17, 18, 17, 18, 19, //top
            20, 21, 22, 21, 22, 23 //bottom
        ]);

        /**
         * @type {Float32Array} position The position of this object relative to its origin (from its parent)
         */
        this.position = new Float32Array(position);

        /**
         * @type {Float32Array} A vec3 describing the acceleration of this primitive, per second
         */
        this.acceleration = GLMatrix.vec3.create([0, 0, 0]);

        /**
         * @type {number} The maximum acceleration per second
         */
        this.maxAcceleration = 3;

        /**
         * @type {Float32Array} A vec3 describing the speed of this primitive, per second
         */
        this.speed = GLMatrix.vec3.create([0, 0, 0]);

        /**
         * @type {number} The maximum speed per second
         */
        this.maxSpeed = 6;

        /**
         * @type {Float32Array} rotation The rotation around each axis
         */
        this.rotation = new Float32Array([0, 0, 0]);

        /**
         * @type {Float32Array} A vec3 describing the rotation around each axis
         */
        this.rotationSpeed = new Float32Array([Math.random(), Math.random(), Math.random()]);

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
            0, 1
        ]);

        // Fill the buffers with the initial position
        this.bufferData(gl);

        this.registerInputs(inputManager);
    }

    /**
     * Pushes the vertex and index arrays into the vertex and index buffers
     * Should be called after modifying the arrays
     * @param {WebGLRenderingContext} gl
     * @returns {undefined}
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
     * @param {ProgramInfo} programInfo - The program info for the in use program
     * @param {Float32Array} originMatrix The origin mvMatrix that this primitive is relative to. Should be the identity if there is no parent.
     * @returns {undefined}
     */
    render(gl, programInfo, originMatrix) {
        var modelViewMatrix = GLMatrix.mat4.clone(originMatrix);
        GLMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, this.position);
        GLMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation[0], [1, 0, 0]);
        GLMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation[1], [0, 1, 0]);
        GLMatrix.mat4.rotate(modelViewMatrix, modelViewMatrix, this.rotation[2], [0, 0, 1]);

        programInfo.uniforms.modelViewMatrix.set(modelViewMatrix);
        programInfo.uniforms.inputColor.set(this.color);
        if (gl.isTexture(this.texture)) {
            programInfo.uniforms.texture1.set(this.texture);
        }

        programInfo.attributes.textureCoordinate.set(this.textureCoordinateBuffer);
        programInfo.attributes.vertexPosition.set(this.vertexBuffer);

        gl.drawElements(gl.TRIANGLES, this.indexArray.length, gl.UNSIGNED_SHORT, 0);
    }

    update(dt) {
        var fracSecond = dt / 1000;

        this.rotation[0] += this.rotationSpeed[0]*(Math.PI/2) * fracSecond;
        this.rotation[1] += this.rotationSpeed[0]*(Math.PI/2) * fracSecond;
        this.rotation[2] += this.rotationSpeed[0]*(Math.PI/2) * fracSecond;

        this.speed[0] += this.acceleration[0] * fracSecond;
        if (this.speed[0] > this.maxSpeed) {
            this.speed[0] = this.maxSpeed;
        } else if (this.speed[0] < -this.maxSpeed) {
            this.speed[0] = -this.maxSpeed;
        }

        this.speed[1] += this.acceleration[1] * fracSecond;
        if (this.speed[1] > this.maxSpeed) {
            this.speed[1] = this.maxSpeed;
        } else if (this.speed[1] < -this.maxSpeed) {
            this.speed[1] = -this.maxSpeed;
        }

        this.position[0] += this.speed[0] * fracSecond;
        this.position[1] += this.speed[1] * fracSecond;
    }

    /**
     * Registers the appropriate input actions for this primitive
     * @param {InputManager} inputManager
     * @returns {undefined}
     */
    registerInputs(inputManager) {
        var handleInput = inputState => {
            this.acceleration[0] = (inputState[inputManager.KEY_TO_CODE["A"]] ? -this.maxAcceleration : 0) + (inputState[inputManager.KEY_TO_CODE["D"]] ? this.maxAcceleration : 0);
            this.acceleration[1] = (inputState[inputManager.KEY_TO_CODE["S"]] ? -this.maxAcceleration : 0) + (inputState[inputManager.KEY_TO_CODE["W"]] ? this.maxAcceleration : 0);

            if (inputState[inputManager.KEY_TO_CODE[" "]]) {
                this.rotationSpeed[0] = Math.random();
                this.rotationSpeed[1] = Math.random();
                this.rotationSpeed[2] = Math.random();
            }

            if (inputState[inputManager.KEY_TO_CODE["shift"]]) {
                this.acceleration[0] = 0;
                this.acceleration[1] = 0;
                this.speed[0] = 0;
                this.speed[1] = 0;
            }
        };

        inputManager.on("keydown", handleInput);
        inputManager.on("keyup", handleInput);
    }
}

module.exports = Cube;

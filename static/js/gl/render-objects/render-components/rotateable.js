"use strict";

const GLMatrix = require("gl-matrix");

const RotatableProto = {
    /**
     * Rotates the object about each of the x y z axis given the angle around each. Pass in zero or null to skip an axis.
     * @param {number[]} rotation - Rotation around x, y, z axis in radians
     * @returns {undefined}
     */
    rotate(rotation) {
        if (rotation[0]) {
            GLMatrix.quat.rotateX(this.quaternion, this.quaternion, rotation[0]);
        }
        if (rotation[1]) {
            GLMatrix.quat.rotateY(this.quaternion, this.quaternion, rotation[1]);
        }
        if (rotation[2]) {
            GLMatrix.quat.rotateZ(this.quaternion, this.quaternion, rotation[2]);
        }
        GLMatrix.mat4.fromQuat(this.rotationMatrix, this.quaternion);
    },

    render(gl, programInfo, modelViewMatrix) {
        GLMatrix.mat4.multiply(modelViewMatrix, modelViewMatrix, this.rotationMatrix);
        return modelViewMatrix;
    }
};

/**
 * Adds the ability for an object to be rotated
 * Performs some caching to speed up rotation matrix generation.
 * @param {Float32Array} rotation - A vector representing the angles of rotation around the x, y, and z axis
 * @constructor
 * @returns {Rotatable}
 */
const Rotatable = (rotation) => {
    if (Object.prototype.toString.call(rotation) !== "[object Float32Array]" || rotation.length != 3) {
        throw new TypeError("Invalid rotation provided to Rotatable factory.");
    }

    const instance = Object.assign(Object.create(RotatableProto), {
        rotation: rotation,
        quaternion: GLMatrix.quat.create(),
        rotationMatrix: GLMatrix.mat4.create()
    });
    instance.rotate(rotation);

    return instance;
};

Rotatable.prototype = RotatableProto;

module.exports = Rotatable;

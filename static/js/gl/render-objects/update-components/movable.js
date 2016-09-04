"use strict";

const GLMatrix = require("gl-matrix");

const MovableProto = {
    updateComponentMovable: true,

    /**
     * Moves the object by the given vec3
     * @param {Float32Array} dVector
     * @returns {undefined}
     */
    move(dVector) {
        GLMatrix.vec3.add(this.position, this.position, dVector);
    }
};

/**
 * Adds the ability for an object to be movable.
 * @param {Object} instance - The instance to be composed with
 * @param {number} maxSpeed - The max speed for the object
 * @constructor
 * @returns {Object}
 */
const Movable = (instance, maxSpeed) => {
    if (!instance.position) {
        throw new TypeError("The Movable update component depends on a 'position' property.");
    }
    if (!instance.updateQueue) {
        throw new TypeError("The Movable update component depends on an 'updateQueue' property.");
    }

    instance.__proto__ = Object.assign(instance.__proto__, MovableProto);

    instance.updateQueue.push(dtSeconds => {
        for (let i = 0; i < instance.position.length; i++) {
            instance.velocity[i] += instance.acceleration[i] * dtSeconds;
            if (instance.velocity[i] > instance.maxSpeed) {
                instance.velocity[i] = instance.maxSpeed;
            } else if (instance.velocity[i] < -instance.maxSpeed) {
                instance.velocity[i] = -instance.maxSpeed;
            }

            instance.position[i] += instance.velocity[i] * dtSeconds;
        }
    });

    return Object.assign(instance, {
        velocity: GLMatrix.vec3.create([0, 0, 0]),
        maxSpeed: maxSpeed,
        acceleration: GLMatrix.vec3.create([0, 0, 0])
    });
};

module.exports = Movable;

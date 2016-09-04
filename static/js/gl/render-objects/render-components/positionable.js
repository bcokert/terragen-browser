"use strict";

const GLMatrix = require("gl-matrix");

const PositionableProto = {
    render(gl, programInfo, modelViewMatrix) {
        GLMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, this.position);
        return modelViewMatrix;
    }
};

/**
 * Adds the ability for an object to be positionable.
 * @param {Float32Array} position
 * @constructor
 * @returns {Meshable}
 */
const Positionable = (position) => {
    if (Object.prototype.toString.call(position) !== "[object Float32Array]" || position.length !== 3) {
        throw new TypeError("Invalid position provided to Positionable factory.");
    }

    return Object.assign(Object.create(PositionableProto), {
        position: position
    });
};

Positionable.prototype = PositionableProto;

module.exports = Positionable;

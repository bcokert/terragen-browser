"use strict";

const ColorableProto = {
    /**
     * Changes the color of the object
     * @param {Float32Array} newColor - A vec4 describing the new color
     * @returns {undefined}
     */
    color(newColor) {
        this.color = newColor;
    },

    render(gl, programInfo, modelViewMatrix) {
        programInfo.uniforms.inputColor.set(this.color);
        return modelViewMatrix;
    }
};

/**
 * Adds the ability for an object to be colored.
 * @param {Float32Array} color
 * @constructor
 * @returns {Meshable}
 */
const Colorable = (color) => {
    if (Object.prototype.toString.call(color) !== "[object Float32Array]" || color.length != 4) {
        throw new TypeError("Invalid color provided to RenderObject factory.");
    }

    return Object.assign(Object.create(ColorableProto), {
        color: color
    });
};

Colorable.prototype = ColorableProto;

module.exports = Colorable;

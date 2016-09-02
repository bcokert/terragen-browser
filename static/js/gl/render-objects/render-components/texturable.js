"use strict";

const TexturableProto = {
    /**
     * Binds and buffers uv data
     * @param {WebGLRenderingContext} gl
     * @returns {undefined}
     */
    updateUVArray(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvArray, gl.STATIC_DRAW);
    },

    render(gl, programInfo, modelViewMatrix) {
        if (gl.isTexture(this.texture)) {
            programInfo.uniforms.texture1.set(this.texture);
            programInfo.attributes.textureCoordinate.set(this.uvBuffer);
        }
        return modelViewMatrix;
    }
};

/**
 * Adds the ability for an object to have a renderable triangle mesh.
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} uvArray - an array containing uv coordinates for this object
 * @param {WebGLTexture|null} texture
 * @constructor
 * @returns {Texturable}
 */
const Texturable = (gl, uvArray, texture) => {
    if (Object.prototype.toString.call(uvArray) !== "[object Float32Array]") {
        throw new TypeError("Invalid uvArray provided to Texturable factory.");
    }

    const instance = Object.assign(Object.create(TexturableProto), {
        uvArray: uvArray,
        uvBuffer: gl.createBuffer(),
        texture: texture
    });

    instance.updateUVArray(gl);

    return instance;
};

Texturable.prototype = TexturableProto;

module.exports = Texturable;

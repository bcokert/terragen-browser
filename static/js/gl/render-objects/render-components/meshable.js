"use strict";

const MeshableProto = {
    /**
     * Binds and buffers vertex data
     * @param {WebGLRenderingContext} gl
     * @returns {undefined}
     */
    updateArrayBuffer(gl) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexArray, gl.STATIC_DRAW);
    },

    /**
     * Binds and buffers index data
     * @param {WebGLRenderingContext} gl
     * @returns {undefined}
     */
    updateIndexBuffer(gl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexArray, gl.STATIC_DRAW);
    },

    render(gl, programInfo, modelViewMatrix) {
        programInfo.attributes.vertexPosition.set(this.vertexBuffer);
        return modelViewMatrix;
    },

    finishRender(gl, programInfo, modelViewMatrix) {
        programInfo.uniforms.modelViewMatrix.set(modelViewMatrix);
        gl.drawElements(gl.TRIANGLES, this.indexArray.length, gl.UNSIGNED_SHORT, 0);
    }
};

/**
 * Adds the ability for an object to have a renderable triangle mesh.
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} vertexArray - an array containing triples of floats, each representing a vertex
 * @param {Float32Array} indexArray - an array containing triples of indexes, each pointing to 3 vertices that make up a triangle
 * @constructor
 * @returns {Meshable}
 */
const Meshable = (gl, vertexArray, indexArray) => {
    if (Object.prototype.toString.call(vertexArray) !== "[object Float32Array]") {
        throw new TypeError("Invalid vertexArray provided to Meshable factory.");
    }
    if (Object.prototype.toString.call(indexArray) !== "[object Float32Array]") {
        throw new TypeError("Invalid indexArray provided to Meshable factory.");
    }

    const instance = Object.assign(Object.create(MeshableProto), {
        vertexArray: vertexArray,
        vertexBuffer: gl.createBuffer(),
        indexArray: indexArray,
        indexBuffer: gl.createBuffer()
    });

    instance.updateArrayBuffer(gl);
    instance.updateIndexBuffer(gl);

    return instance;
};

Meshable.prototype = MeshableProto;

module.exports = Meshable;

"use strict";

const GLMatrix = require("gl-matrix");
const Rotatable = require("./render-components/rotateable");
const Positionable = require("./render-components/positionable");
const Meshable = require("./render-components/meshable");
const Texturable = require("./render-components/texturable");
const Colorable = require("./render-components/colorable");

const CubeMesh = require("../prebuilt-meshes/cube");

const BasicObjectProto = Object.assign(Rotatable.prototype, Positionable.prototype, {
    render(gl, programInfo, modelViewMatrix) {
        this.renderQueue.forEach(renderStep => {
            modelViewMatrix = renderStep(gl, programInfo, modelViewMatrix);
        });

        if (this.finishRender) {
            this.finishRender(gl, programInfo, modelViewMatrix);
        } else {
            throw new Error("A finishRender method was not added to the basic object during composition");
        }
    }
});

/**
 * A test object that is fully composed
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} position
 * @param {Float32Array} color
 * @param {WebGLTexture|null} texture
 * @returns {BasicObject}
 * @constructor
 */
const BasicObject = (gl, position, color, texture) => {
    return Object.assign(
        Object.create(BasicObjectProto),
        Rotatable(GLMatrix.vec3.create()),
        Positionable(position),
        Meshable(gl, CubeMesh.vertexArray, CubeMesh.indexArray),
        Texturable(gl, CubeMesh.uvArray, texture),
        Colorable(color), {
            renderQueue: [Rotatable.prototype.render, Positionable.prototype.render, Meshable.prototype.render, Texturable.prototype.render, Colorable.prototype.render]
        }
    );
};

BasicObject.prototype = BasicObjectProto;

module.exports = BasicObject;

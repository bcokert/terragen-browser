"use strict";

const GLMatrix = require("gl-matrix");
const Rotatable = require("./render-components/rotateable");
const Positionable = require("./render-components/positionable");
const Meshable = require("./render-components/meshable");
const Texturable = require("./render-components/texturable");
const Colorable = require("./render-components/colorable");

const CubeMesh = require("../prebuilt-meshes/cube");

const BasicObjectProto = Object.assign(Object.create({}), Rotatable.prototype, Positionable.prototype, Meshable.prototype, Texturable.prototype, Colorable.prototype, {
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
    const instance = Object.assign(
        Object.create(BasicObjectProto),
        Rotatable(GLMatrix.vec3.create()),
        Positionable(position),
        Meshable(gl, CubeMesh.vertexArray, CubeMesh.indexArray),
        Texturable(gl, CubeMesh.uvArray, texture),
        Colorable(color)
    );

    instance.renderQueue = [
        Rotatable.prototype.render.bind(instance),
        Positionable.prototype.render.bind(instance),
        Meshable.prototype.render.bind(instance),
        Texturable.prototype.render.bind(instance),
        Colorable.prototype.render.bind(instance)
    ];

    return instance;
};

BasicObject.prototype = BasicObjectProto;

module.exports = BasicObject;

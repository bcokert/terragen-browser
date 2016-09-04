"use strict";

const GLMatrix = require("gl-matrix");
const InputManager = require("../input/input-manager");

const Rotatable = require("./render-components/rotateable");
const Positionable = require("./render-components/positionable");
const Meshable = require("./render-components/meshable");
const Texturable = require("./render-components/texturable");
const Colorable = require("./render-components/colorable");

const Movable = require("./update-components/movable");

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
    },

    update(dtSeconds) {
        this.updateQueue.forEach(updateStep => updateStep(dtSeconds));
    },

    handleInput(inputState) {
        this.acceleration[0] = (inputState[InputManager.KEY_TO_CODE["A"]] ? -10 : 0) + (inputState[InputManager.KEY_TO_CODE["D"]] ? 10 : 0);
        this.acceleration[1] = (inputState[InputManager.KEY_TO_CODE["S"]] ? -10 : 0) + (inputState[InputManager.KEY_TO_CODE["W"]] ? 10 : 0);

        if (inputState[InputManager.KEY_TO_CODE[" "]]) {
            this.acceleration[0] = 0;
            this.acceleration[1] = 0;
            this.velocity[0] = 0;
            this.velocity[1] = 0;
        }

        let rx = (inputState[InputManager.KEY_TO_CODE["up"]] ? -.1 : .1) + (inputState[InputManager.KEY_TO_CODE["down"]] ? .1 : -.1);
        let ry = (inputState[InputManager.KEY_TO_CODE["left"]] ? .1 : -.1) + (inputState[InputManager.KEY_TO_CODE["right"]] ? -.1 : .1);
        this.rotate([rx, ry, 0]);
    }
});

/**
 * A test object that is fully composed
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} position
 * @param {Float32Array} color
 * @param {WebGLTexture|null} texture
 * @param {InputManager} inputManager
 * @returns {BasicObject}
 * @constructor
 */
const BasicObject = (gl, position, color, texture, inputManager) => {
    let instance = Object.assign(
        Object.create(BasicObjectProto),
        Rotatable(new Float32Array([0, 0, 0])),
        Positionable(position),
        Meshable(gl, CubeMesh.vertexArray, CubeMesh.indexArray),
        Texturable(gl, CubeMesh.uvArray, texture),
        Colorable(color),{
            updateQueue: []
        }
    );

    instance = Movable(instance, 8);

    inputManager.on("keydown", instance.handleInput.bind(instance));
    inputManager.on("keyup", instance.handleInput.bind(instance));

    instance.renderQueue = [
        Positionable.prototype.render.bind(instance),
        Rotatable.prototype.render.bind(instance),
        Meshable.prototype.render.bind(instance),
        Texturable.prototype.render.bind(instance),
        Colorable.prototype.render.bind(instance)
    ];

    return instance;
};

BasicObject.prototype = BasicObjectProto;

module.exports = BasicObject;

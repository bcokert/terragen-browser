"use strict";

var Utils = {
    /**
     * Grabs the uniforms of the fragment shader
     * @param {WebGLRenderingContext} gl The gl rendering context
     * @param {WebGLProgram} shaderProgram The program to initialize with
     * @return {Object.<string, number>}
     */
    getUniforms: (gl, shaderProgram) => {
        return {
            inputColor: gl.getUniformLocation(shaderProgram, "inputColor"),
            sampler: gl.getUniformLocation(shaderProgram, "sampler")
        };
    }
};

module.exports = Utils;

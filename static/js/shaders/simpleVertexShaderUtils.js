"use strict";

var Utils = {
    /**
     * Grabs the attributes and uniforms of the vertex shader
     * @param {WebGLRenderingContext} gl The gl rendering context
     * @param {WebGLProgram} shaderProgram The program to initialize with
     * @return {{
     *   attributes: object.<string, any>,
     *   uniforms: object.<string, any>
     * }}
     */
    getAttributesAndUniforms: (gl, shaderProgram) => {
        var vertexPosition = gl.getAttribLocation(shaderProgram, "vertexPosition");
        gl.enableVertexAttribArray(shaderProgram.inputVertex);

        var perspectiveMatrix = gl.getUniformLocation(shaderProgram, "perspectiveMatrix");
        var modelViewMatrix = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

        return {
            attributes: {
                vertexPosition: vertexPosition
            },
            uniforms: {
                perspectiveMatrix: perspectiveMatrix,
                modelViewMatrix: modelViewMatrix
            }
        };
    }
};

module.exports = Utils;

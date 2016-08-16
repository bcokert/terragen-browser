"use strict";

var Utils = {
    /**
     * Grabs the attributes of the vertex shader
     * @param {WebGLRenderingContext} gl The gl rendering context
     * @param {WebGLProgram} shaderProgram The program to initialize with
     * @return {Object.<string, number>}
     */
    getAttributes: (gl, shaderProgram) => {
        var vertexPosition = gl.getAttribLocation(shaderProgram, "vertexPosition");
        gl.enableVertexAttribArray(vertexPosition);

        var textureCoordinate = gl.getAttribLocation(shaderProgram, "textureCoordinate");
        gl.enableVertexAttribArray(textureCoordinate);

        return {
            vertexPosition: vertexPosition,
            textureCoordinate: textureCoordinate
        };
    },

    /**
     * Grabs the uniforms of the vertex shader
     * @param {WebGLRenderingContext} gl The gl rendering context
     * @param {WebGLProgram} shaderProgram The program to initialize with
     * @return {Object.<string, number>}
     */
    getUniforms: (gl, shaderProgram) => {
        return {
            cameraRotationMatrix: gl.getUniformLocation(shaderProgram, "cameraRotationMatrix"),
            perspectiveMatrix: gl.getUniformLocation(shaderProgram, "perspectiveMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "modelViewMatrix")
        };
    }
};

module.exports = Utils;

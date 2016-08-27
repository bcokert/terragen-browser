"use strict";

const ProgramManagerProto = {
    /**
     * Retrieves a program from the cache, or tries to build it.
     * If an error occurs while building, it caches the error and returns it
     * @param {string} programName - The name of the program as in the original shaderSources map
     * @returns {WebGLProgram|Error}
     */
    getProgram(programName) {
        if (this.cache[programName] === undefined) {
            this.addProgramToCache(programName);
        }
        return this.cache[programName];
    },

    /**
     * Uses the ProgramCompiler to create a new program using the given sources, and adds it to the cache
     * @param {string} programName - The name of the program as in the original shaderSources map
     * @returns {undefined}
     */
    addProgramToCache(programName) {
        const vertexShaderSource = this.shaderSources[programName].vertexShader;
        const fragmentShaderSource = this.shaderSources[programName].fragmentShader;

        if (!vertexShaderSource) {
            this.cache[programName] = Error("Unable to create program - no vertex shader source was found for the given program");
        }
        if (!fragmentShaderSource) {
            this.cache[programName] = Error("Unable to create program - no fragment shader source was found for the given program");
        }

        const vertexShader = this.programCompiler.compileShader(this.gl, vertexShaderSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.programCompiler.compileShader(this.gl, fragmentShaderSource, this.gl.FRAGMENT_SHADER);
        this.cache[programName] = this.programCompiler.createShaderProgram(this.gl, vertexShader, fragmentShader);
    }
};

/**
 * Creates a new ProgramManager, which caches compiled programs and handles compiling new ones on request
 * @param {WebGLRenderingContext} gl
 * @param {object.<string, {vertexShader: string, fragmentShader: string}>} shaderSources - The map from program to shader source code
 * @param {ProgramCompiler} programCompiler - The compiler for programs that are not already cached
 * @returns {ProgramManager}
 * @constructor
 */
const ProgramManager = (gl, shaderSources, programCompiler) => {
    return Object.assign(Object.create(ProgramManagerProto), {
        /**
         * @type {object.<string, WebGLProgram>}
         */
        cache: {},
        gl: gl,
        programCompiler: programCompiler,
        shaderSources: shaderSources
    });
};

ProgramManager.prototype = ProgramManagerProto;

module.exports = ProgramManager;

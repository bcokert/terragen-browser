"use strict";
var React = require("react");
var SimpleVertexShaderSource = require("../../shaders/simpleVertexShader.glsl");
var SimpleVertexShaderUtils = require("../../shaders/simpleVertexShaderUtils");
var SimpleFragmentShaderSource = require("../../shaders/simpleFragmentShader.glsl");
var SimpleFragmentShaderUtils = require("../../shaders/simpleFragmentShaderUtils");
var GLMatrix = require("gl-matrix");
var Cube = require("../../gl-primitives/cube");
var TextureLoader = require("../../texture/texture-loader");

require("./webgl.less");

class WebGL extends React.Component {
    constructor (props) {
        super(props);

        this._canvas = null; // ref to root canvas element

        this.state = {
            initError: undefined,
            isLoadingTextures: false
        };
    }

    componentDidMount () {
        var gl = this.createGLContext(this._canvas);
        this.setState({isLoadingTextures: true});
        if (gl) {
            TextureLoader.loadTextures(gl).then(textures => {
                this.setState({isLoadingTextures: false});
                // Configure some gl globals
                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.enable(gl.DEPTH_TEST);

                // Create program
                var vertexShader = this.compileShader(gl, SimpleVertexShaderSource, gl.VERTEX_SHADER);
                var fragmentShader = this.compileShader(gl, SimpleFragmentShaderSource, gl.FRAGMENT_SHADER);
                var shaderProgram = this.createShaderProgram(gl, vertexShader, fragmentShader);
                gl.useProgram(shaderProgram);

                // Get the standard attributes and uniforms from the program
                var vertexAttributes = SimpleVertexShaderUtils.getAttributes(gl, shaderProgram);
                var vertexUniforms = SimpleVertexShaderUtils.getUniforms(gl, shaderProgram);
                var fragmentUniforms = SimpleFragmentShaderUtils.getUniforms(gl, shaderProgram);

                // Create the perspective matrix
                var perspectiveMatrix = GLMatrix.mat4.create();
                GLMatrix.mat4.perspective(perspectiveMatrix, 45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100.0);

                // Create the world modelView matrix
                var modelViewMatrix = GLMatrix.mat4.create();
                GLMatrix.mat4.identity(modelViewMatrix);

                // Create test cubes
                var cubes = [2, 1, 3].map((size, i) => new Cube(gl, size, [(i - 1) * 5, i - 1, -8], GLMatrix.vec4.fromValues(Math.random(), Math.random(), Math.random(), 1), textures["testWoodTexture"]));

                // Render a single frame with the fake geometry
                this.startRenderLoop(gl, perspectiveMatrix, modelViewMatrix, vertexAttributes, vertexUniforms, fragmentUniforms, cubes);
            });
        } else {
            this.setState({initError: "Unable to create context. The browser does not support WebGL."});
        }
    }

    /**
     * Creates the main gl context object
     * @param {HTMLElement} canvas
     * @returns {WebGLRenderingContext}
     */
    createGLContext (canvas) {
        var gl;
        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        } catch (e) {
        }

        return gl ? gl : undefined;
    }

    /**
     * Takes the source of a glsl shader and compiles it, returning the resulting WebGLShader, or an Error if it fails
     * @param {WebGLRenderingContext} gl The gl rendering context to compile with
     * @param {string} shaderSource The source of the shader, typically acquired via require('../path/to/shader.xx')
     * @param {number} shaderType The shader type, either gl.FRAGMENT_SHADER or gl.VERTEX_SHADER.
     * @throws {TypeError}
     * @returns {WebGLShader|Error}
     */
    compileShader(gl, shaderSource, shaderType) {
        if (typeof shaderSource !== "string" || shaderSource === "") {
            throw new TypeError("Invalid shaderSource provided to compileShader.");
        }
        if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
            throw new TypeError("Invalid shaderType provided to compileShader.");
        }
        if (!gl || !gl.createShader) {
            throw new TypeError("Invalid rendering context provided to compileShader.");
        }

        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return new Error("Unable to compile shader: " + gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    /**
     * Combines compiled shaders into a WebGLProgram and returns it, or an Error if it fails
     * @param {WebGLRenderingContext} gl The gl rendering context to compile with
     * @param {WebGLShader} vertexShader The compiled vertex shader, eg that from compileShader()
     * @param {WebGLShader} fragmentShader The compiled fragment shader, eg that from compileShader()
     * @returns {WebGLProgram|Error}
     */
    createShaderProgram(gl, vertexShader, fragmentShader) {
        if (!gl || !gl.createProgram) {
            throw new TypeError("Invalid rendering context provided to createShaderProgram.");
        }
        if (!gl.isShader(vertexShader)) {
            throw new TypeError("Invalid vertexShader provided to createShaderProgram.");
        }
        if (!gl.isShader(fragmentShader)) {
            throw new TypeError("Invalid fragmentShader provided to createShaderProgram.");
        }

        var shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            return new Error("Unable to create shader program: " + gl.getProgramInfoLog(shaderProgram));
        }

        return shaderProgram;
    }

    startRenderLoop(gl, perspectiveMatrix, modelViewMatrix, vertexAttributes, vertexUniforms, fragmentUniforms, cubes) {

        var render = () => {
            if (gl.canvas.width !== gl.canvas.clientWidth || gl.canvas.height !== gl.canvas.clientHeight) {
                gl.canvas.width = gl.canvas.clientWidth;
                gl.canvas.height = gl.canvas.clientHeight;
            }

            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Push the perspective matrix
            gl.uniformMatrix4fv(vertexUniforms.perspectiveMatrix, false, perspectiveMatrix);

            // Render the cubes
            cubes.forEach(cube => cube.render(gl, modelViewMatrix, vertexAttributes, vertexUniforms, fragmentUniforms));
        };

        var animate = dt => {
            cubes.forEach(cube => cube.animate(dt));
        };

        var lastTime = 0;
        var renderLoop = () => {
            requestAnimationFrame(renderLoop);
            render();
            var now = Date.now();
            if (lastTime === 0) {
                lastTime = Date.now();
            }
            animate(now - lastTime);
            lastTime = now;
        };

        renderLoop();
    }

    render () {
        if (this.state.initError) {
            return <p>{this.state.initError}</p>;
        }

        var notice = null;
        if (this.state.initError) {
            notice = <p>{this.state.initError}</p>;
        }
        if (this.state.isLoadingTextures) {
            notice = <p>Please wait while we load textures</p>;
        }
        return (
            <div className="WebGL">
                {notice}
                <canvas ref={node => this._canvas = node}/>
            </div>
        );
    }
}

WebGL.displayName = "WebGL";

WebGL.propTypes = {};

module.exports = WebGL;

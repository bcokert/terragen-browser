"use strict";
var React = require("react");
var SimpleVertexShaderSource = require("../../gl/shaders/simpleVertexShader.glsl");
var SimpleVertexShaderUtils = require("../../gl/shaders/simpleVertexShaderUtils");
var SimpleFragmentShaderSource = require("../../gl/shaders/simpleFragmentShader.glsl");
var SimpleFragmentShaderUtils = require("../../gl/shaders/simpleFragmentShaderUtils");
var GLMatrix = require("gl-matrix");
var Cube = require("../../gl/primitives/cube");
var TextureLoader = require("../../gl/texture/texture-loader");
var InputManager = require("../../gl/input/input-manager");

require("./webgl.less");

class WebGL extends React.Component {
    constructor (props) {
        super(props);

        this._canvas = null; // ref to root canvas element

        this.state = {
            frameRate: 0,
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

                // Create the camera rotation matrix
                var cameraRotationMatrix = GLMatrix.mat4.create();
                GLMatrix.mat4.identity(modelViewMatrix);

                // Create global input manager
                var inputManager = new InputManager();

                // Add some event handlers for the mouse, to modify the rotation matrix
                var isMouseDragging = false;
                var mouseDragStartCoords = null;
                inputManager.on("mousedown", (inputState, coords) => {
                    isMouseDragging = true;
                    mouseDragStartCoords = coords;
                });

                inputManager.on("mouseup", () => {
                    isMouseDragging = false;
                    mouseDragStartCoords = null;
                });

                inputManager.on("mousemove", (inputState, coords) => {
                    if (isMouseDragging && mouseDragStartCoords) {
                        var dx = mouseDragStartCoords.x - coords.x;
                        var dy = mouseDragStartCoords.y - coords.y;
                        GLMatrix.mat4.rotate(cameraRotationMatrix, cameraRotationMatrix, dx/300, [0, 1, 0]);
                        GLMatrix.mat4.rotate(cameraRotationMatrix, cameraRotationMatrix, dy/300, [1, 0, 0]);
                        mouseDragStartCoords.x = coords.x;
                        mouseDragStartCoords.y = coords.y;
                    }
                });

                // Create test cubes
                var cubes = [2, 1, 3].map((size, i) => new Cube(gl, size, [(i - 1) * 5, i - 1, -8], GLMatrix.vec4.fromValues(Math.random(), Math.random(), Math.random(), 1), textures["testWoodTexture"], inputManager));

                // Start the system, which starts the render loop and logic loop
                this.start(gl, perspectiveMatrix, modelViewMatrix, cameraRotationMatrix, vertexAttributes, vertexUniforms, fragmentUniforms, cubes);
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

    /**
     * Takes an initialized rendering context and all the uniforms, attributes, and objects it needs, then
     * kicks off the renderLoop and logicLoop
     * @param {WebGLRenderingContext} gl
     * @param {Float32Array} perspectiveMatrix
     * @param {Float32Array} modelViewMatrix
     * @param {Float32Array} cameraRotationMatrix
     * @param {Object.<string, int>} vertexAttributes
     * @param {Object.<string, WebGLUniformLocation>} vertexUniforms
     * @param {Object.<string, WebGLUniformLocation>} fragmentUniforms
     * @param {Cube[]} cubes
     */
    start(gl, perspectiveMatrix, modelViewMatrix, cameraRotationMatrix, vertexAttributes, vertexUniforms, fragmentUniforms, cubes) {
        var renderLoop = this.renderLoopFactory(gl, perspectiveMatrix, modelViewMatrix, cameraRotationMatrix, vertexAttributes, vertexUniforms, fragmentUniforms, cubes);
        var logicLoop = this.logicLoopFactory(cubes);

        renderLoop();
        logicLoop();
    }

    /**
     * Creates a renderLoop from the rendering context and everything required to render
     * The resulting render loop will run as fast as the underlying hardware will allow
     * @param {WebGLRenderingContext} gl
     * @param {Float32Array} perspectiveMatrix
     * @param {Float32Array} modelViewMatrix
     * @param {Float32Array} cameraRotationMatrix
     * @param {Object.<string, int>} vertexAttributes
     * @param {Object.<string, WebGLUniformLocation>} vertexUniforms
     * @param {Object.<string, WebGLUniformLocation>} fragmentUniforms
     * @param {Cube[]} cubes
     * @returns {function} The function to call to start the render loop
     */
    renderLoopFactory(gl, perspectiveMatrix, modelViewMatrix, cameraRotationMatrix, vertexAttributes, vertexUniforms, fragmentUniforms, cubes) {
        var lastRenderTime = 0;
        var msPerFrame = 0;
        var now = 0;
        var renderLoop = () => {
            requestAnimationFrame(renderLoop);

            // Update the frame rate
            now = Date.now();
            msPerFrame = now - lastRenderTime;
            lastRenderTime = now;

            // Update the viewport config if it has changed
            if (gl.canvas.width !== gl.canvas.clientWidth || gl.canvas.height !== gl.canvas.clientHeight) {
                gl.canvas.width = gl.canvas.clientWidth;
                gl.canvas.height = gl.canvas.clientHeight;
            }

            // Reset the viewport to the new config, and clear the render buffer
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Push the perspective matrix
            gl.uniformMatrix4fv(vertexUniforms.perspectiveMatrix, false, perspectiveMatrix);

            // Push the camera rotation matrix
            gl.uniformMatrix4fv(vertexUniforms.cameraRotationMatrix, false, cameraRotationMatrix);

            // Render the objects
            cubes.forEach(cube => cube.render(gl, modelViewMatrix, vertexAttributes, vertexUniforms, fragmentUniforms));
        };

        return () => {
            lastRenderTime = Date.now();
            setInterval(() => this.setState({frameRate: parseInt(1 / (msPerFrame / 1000), 10)}), 5000);
            renderLoop();
        };
    }

    /**
     * Creates a logicLoop for the current scene
     * The resulting logicLoop runs at a constant rate, unless the cpu is actually overloaded (which is rare since webGL will prefer to drop render calls instead)
     * It will pass in the delta time to all children to handle this case
     * @param {Cube[]} cubes
     * @returns {function} The function call to start the logic loop
     */
    logicLoopFactory(cubes) {
        var now = 0;
        var lastTime = 0;
        var delta = 0;

        var logicFunction = () => {
            now = Date.now();
            delta = now - lastTime;
            lastTime = now;

            cubes.forEach(cube => cube.update(delta));
        };

        return () => {
            lastTime = Date.now();
            setInterval(logicFunction, 1000/60);
        };
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
                <div className="-frameRateDisplay">Frame Rate (±3): {this.state.frameRate}</div>
                <canvas key="renderCanvas" ref={node => this._canvas = node}/>
            </div>
        );
    }
}

WebGL.displayName = "WebGL";

WebGL.propTypes = {};

module.exports = WebGL;

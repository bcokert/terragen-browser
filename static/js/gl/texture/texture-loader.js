"use strict";

class TextureLoader  {

    /**
     * Starts the loading of all textures, returning a promise who's resolver will pass in a map from texture
     * name to gl texture objects.
     * @param {WebGLRenderingContext} gl
     * @return {Promise} that resolves with Object.<string, WebGLTexture>
     */
    static loadTextures(gl) {
        return new Promise((resolve) => {
            var textureSources = [{
                name: "testWoodTexture",
                url: require("../../../img/textures/testWoodTexture.jpg"),
                shouldFlipY: true
            }];

            var loadedTextures = {};

            var finishLoading = (texture, textureImage, textureSource) => {

                gl.bindTexture(gl.TEXTURE_2D, texture);
                if (textureSource.shouldFlipY) {
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                }
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.bindTexture(gl.TEXTURE_2D, null);

                loadedTextures[textureSource.name] = texture;

                if (Object.keys(loadedTextures).length === textureSources.length) {
                    resolve(loadedTextures);
                }
            };

            textureSources.forEach(textureSource => {
                var texture = gl.createTexture();
                var textureImage = new Image();
                textureImage.onload = () => finishLoading(texture, textureImage, textureSource);
                textureImage.src = textureSource.url;
            });
        });
    }
}

module.exports = TextureLoader;

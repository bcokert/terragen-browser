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
            var textureUrls = [
                require("../../img/textures/testWoodTexture.jpg")
            ];

            var loadedTextures = [];

            var finishLoading = texture => {
                loadedTextures.push(texture);
                if (loadedTextures.length === textureUrls.length) {
                    setTimeout(() => resolve(loadedTextures), 5000);
                }
            };

            textureUrls.forEach(textureUrl => {
                var texture = gl.createTexture();
                var textureImage = new Image();
                textureImage.onload = () => finishLoading(texture);
                textureImage.src = textureUrl;
            });
        });
    }
}

module.exports = TextureLoader;

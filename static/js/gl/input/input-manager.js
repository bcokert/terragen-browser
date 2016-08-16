"use strict";

var EventEmitter3 = require("eventemitter3");

class InputManager {
    constructor() {
        this.emitter = new EventEmitter3();
        this.inputState = {};

        this.emit = this.emit.bind(this);
        this.on = this.on.bind(this);
        this.setState = this.setState.bind(this);

        window.addEventListener("keydown", e => {
            if (!this.inputState[e.keyCode]) {
                this.inputState[e.keyCode] = Date.now();
                this.emit("keydown", e.keyCode);
            }
        });

        window.addEventListener("keyup", e => {
            this.inputState[e.keyCode] = null;
            this.emit("keyup", e.keyCode);
        });

        window.addEventListener("mousedown", e => {
            this.KEY_TO_CODE["mousedown"] = Date.now();
            this.emit("mousedown", {x: e.clientX, y: e.clientY});
        });

        window.addEventListener("mousemove", e => {
            this.KEY_TO_CODE["mousemove"] = Date.now();
            this.emit("mousemove", {x: e.clientX, y: e.clientY});
        });

        window.addEventListener("mouseup", e => {
            this.KEY_TO_CODE["mouseup"] = Date.now();
            this.emit("mouseup", {x: e.clientX, y: e.clientY});
        });

        this.KEY_TO_CODE = InputManager.KEY_TO_CODE;
    }

    setState(key, value) {
        if (typeof key === "number") {
            throw new Error("Tried to setState with a number in InputManager: " + key);
        }
        this.inputState[key] = value;
    }

    getState() {
        var newState = {};
        var keys = Object.keys(this.inputState);
        for (var i=0; i < keys.length; i++) {
            newState[keys[i]] = this.inputState[keys[i]];
        }

        return newState;
    }

    emit(name, args) {
        this.emitter.emit(name, this.getState(), args);
    }

    on(name, callback) {
        this.emitter.on(name, callback);
    }
}

InputManager.KEY_TO_CODE = {
    "backspace": 8,
    "tab": 9,
    "enter": 13,
    "shift": 16,
    "ctrl": 17,
    "alt": 18,
    "escape": 27,
    "space": 32,
    "left": 37,
    "up": 38,
    "right": 39,
    "down": 40,
    "f1": 112,
    "f2": 113,
    "f3": 114,
    "f4": 115,
    "f5": 116,
    "f6": 117,
    "f7": 118,
    "f8": 119,
    "f9": 120,
    "f10": 121,
    "f11": 122,
    "f12": 123,
};
var letterKeys=" ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_+=!@#$%^&*()<,>.?/|\\{[}]~`:;\"'";
for (var i=0; i<letterKeys.length; i++) {
    InputManager.KEY_TO_CODE[letterKeys[i]] = letterKeys.charCodeAt(i);
}

module.exports = InputManager;

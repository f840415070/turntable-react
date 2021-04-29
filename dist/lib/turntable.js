"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var controller_1 = __importDefault(require("./controller"));
var Turntable = function (props) {
    var size = props.size, prizes = props.prizes, children = props.children, onStart = props.onStart, opts = __rest(props, ["size", "prizes", "children", "onStart"]);
    var controller;
    react_1.useEffect(function () {
        controller = new controller_1.default(size, prizes, opts);
        controller.init();
    }, []);
    var drawing = function (fetchResult, startTime) {
        fetchResult
            .then(function (index) {
            if (startTime === controller.ref.timeNode) {
                controller.setCurrentPrizeIndex(index);
            }
        })
            .catch(function () {
            controller.abort();
        });
    };
    var drawingAfterGotResult = function (fetchResult, startTime) {
        controller.changeState(true);
        controller.recordTimeout(startTime);
        fetchResult
            .then(function (index) {
            if (startTime === controller.ref.timeNode) {
                controller.setCurrentPrizeIndex(index);
                controller.rotate();
            }
        })
            .catch(function () {
            controller.abort();
        });
    };
    var run = function () {
        if (controller.isDrawing)
            return;
        var startResult = onStart(controller.abort.bind(controller));
        if (startResult instanceof Promise) {
            controller.reset();
            if (controller.opts.mode === 'immediate') {
                controller.rotate();
                drawing(startResult, controller.ref.timeNode);
            }
            else {
                drawingAfterGotResult(startResult, controller.ref.timeNode);
            }
        }
    };
    return (react_1.default.createElement("div", { className: "__turntable-container", style: { position: 'relative', width: size + "px", height: size + "px" } },
        react_1.default.createElement("canvas", { id: "__turntable-canvas", width: size, height: size }, "You need to update your browser to support canvas."),
        react_1.default.createElement("div", { className: "__turntable-over-box", style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: size + "px",
                height: size + "px",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            } },
            react_1.default.createElement("div", { className: "__turntable-pointer", onClick: run }, children))));
};
exports.default = Turntable;

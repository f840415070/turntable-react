"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 兼容 window.requestAnimationFrame, window.cancelAnimationFrame
(function (window) {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"]
            || window[vendors[x] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            window.clearTimeout(id);
        };
    }
}(window));
var PI = Math.PI, floor = Math.floor;
var requestAnimationFrame = window.requestAnimationFrame, cancelAnimationFrame = window.cancelAnimationFrame, setTimeout = window.setTimeout, clearTimeout = window.clearTimeout, _a = window.devicePixelRatio, devicePixelRatio = _a === void 0 ? 1 : _a;
function checkOpts(opts) {
    return ({
        renderIfLoaded: opts.renderIfLoaded !== false,
        renderIfLoadedTimeout: (opts.renderIfLoadedTimeout && opts.renderIfLoadedTimeout > 0) ? opts.renderIfLoadedTimeout : 300,
        onComplete: typeof opts.onComplete === 'function' ? opts.onComplete : function () { },
        pointToMiddle: opts.pointToMiddle || false,
        timeout: opts.timeout && opts.timeout > 0 ? opts.timeout : 10000,
        onTimeout: typeof opts.onTimeout === 'function' ? opts.onTimeout : function () { },
        auto: opts.auto !== false,
        autoSpeed: opts.autoSpeed && opts.autoSpeed > 0 && opts.autoSpeed < 6 ? opts.autoSpeed : 2,
        autoDelay: opts.autoDelay && opts.autoDelay >= 0 ? opts.autoDelay : 2000,
        turntableBackground: opts.turntableBackground ? opts.turntableBackground : 'transparent',
    });
}
var Controller = /** @class */ (function () {
    function Controller(size, prizes, opts) {
        var _this = this;
        this.canvas = document.getElementById('__turntable-canvas');
        if (!this.canvas) {
            throw new Error('Can not get canvas element!');
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error('Can not get canvas context!');
        }
        this.size = size;
        this.prizes = prizes;
        this.opts = checkOpts(opts);
        this.radius = size / 2;
        this.eachRad = 2 * PI / prizes.length;
        this.startRad = this._initStartRad;
        this.rotateToPointerRads = prizes.map(function (_, index) {
            var rotateRad = 2 * PI + _this.startRad - (_this.eachRad * index + _this.eachRad / 2);
            return rotateRad > 0 ? rotateRad : rotateRad + 2 * PI;
        });
        this.isInitRendered = false;
        this.isRotating = false;
        this._CURRENT_PRIZE_INDEX = -9999;
        this.isAborted = false;
        this.ref = { timeNode: +new Date() };
        this.autoConf = {
            timer: -9999,
            rafHandle: -9999,
        };
    }
    Controller.prototype.init = function () {
        this._resizeCanvas();
        this.ctx.translate(this.radius, this.radius);
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius, 0, PI * 2);
        this.ctx.fillStyle = this.opts.turntableBackground;
        this.ctx.fill();
        this.ctx.restore();
        this.initRender();
    };
    Controller.prototype._resizeCanvas = function () {
        this.canvas.style.width = this.size + "px";
        this.canvas.style.height = this.size + "px";
        this.canvas.width = floor(this.size * devicePixelRatio);
        this.canvas.height = floor(this.size * devicePixelRatio);
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    Object.defineProperty(Controller.prototype, "_initStartRad", {
        get: function () {
            return -PI / 2 - (this.opts.pointToMiddle ? (this.eachRad / 2) : 0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Controller.prototype, "_nextStartRad", {
        get: function () {
            return this.startRad + 0.116 * PI;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Controller.prototype, "currentPrizeIndex", {
        get: function () {
            return this._CURRENT_PRIZE_INDEX;
        },
        enumerable: false,
        configurable: true
    });
    Controller.prototype.setCurrentPrizeIndex = function (index) {
        if (index >= 0) {
            this._CURRENT_PRIZE_INDEX = index;
        }
    };
    Controller.prototype.abort = function () {
        this.isAborted = true;
    };
    Controller.prototype.reset = function () {
        this.isRotating = false;
        this.startRad = this._initStartRad;
        this._CURRENT_PRIZE_INDEX = -9999;
        this.isAborted = false;
        this.ref.timeNode = +new Date();
    };
    Controller.prototype.rotate = function () {
        this.cancelAuto();
        this.isRotating = true;
        var runTime = +new Date();
        this._rotate(runTime);
        this.ref.timeNode = runTime;
    };
    Controller.prototype._easeRotate = function (rotateRad) {
        var _this = this;
        this.startRad += (rotateRad - this.startRad) / 20;
        if (rotateRad - this.startRad <= 0.01) {
            this.opts.onComplete(this.currentPrizeIndex);
            this.reset();
            return;
        }
        this._render();
        requestAnimationFrame(function () {
            _this._easeRotate(rotateRad);
        });
    };
    Controller.prototype._rotate = function (startTime) {
        var _this = this;
        if (this.currentPrizeIndex >= 0) {
            this.startRad = this._initStartRad;
            var rotateRad = this.rotateToPointerRads[this.currentPrizeIndex]
                + 40 * PI
                + (this.opts.pointToMiddle ? (this.eachRad / 2) : 0);
            this._easeRotate(rotateRad);
            return;
        }
        if (+new Date() - startTime > this.opts.timeout) {
            this.reset();
            this._render();
            this.opts.onTimeout();
            return;
        }
        if (this.isAborted) {
            this.reset();
            this._render();
            return;
        }
        this.startRad = this._nextStartRad;
        this._render();
        requestAnimationFrame(function () {
            _this._rotate(startTime);
        });
    };
    Controller.prototype.autoStart = function () {
        var _this = this;
        if (this.opts.auto) {
            this.autoConf.timer = setTimeout(function () {
                _this.autoRotate();
            }, this.opts.autoDelay);
        }
    };
    Controller.prototype.cancelAuto = function () {
        if (this.opts.auto) {
            clearTimeout(this.autoConf.timer);
            cancelAnimationFrame(this.autoConf.rafHandle);
            this.reset();
        }
    };
    Controller.prototype.autoRotate = function () {
        var _this = this;
        this.startRad += 0.0001 * (this.opts.autoSpeed + 5) * PI;
        this._render();
        this.autoConf.rafHandle = requestAnimationFrame(function () {
            _this.autoRotate();
        });
    };
    Controller.prototype.initRender = function () {
        var _this = this;
        if (this.prizes.some(function (item) { return !!item.images; }) && this.opts.renderIfLoaded) {
            // 等待所有图片都进入加载结束状态再绘制转盘
            // 避免因为图片未加载完，canvas drawImage 失败而导致图片没有绘制
            this.allImagesLoaded().then(function (_) {
                _this._initRender();
            });
            setTimeout(function () {
                _this._initRender();
            }, this.opts.renderIfLoadedTimeout);
        }
        else {
            this._initRender();
        }
    };
    Controller.prototype.allImagesLoaded = function () {
        var promises = [];
        this.prizes.forEach(function (item) {
            if (Array.isArray(item.images) && item.images.length > 0) {
                item.images.forEach(function (imageItem) {
                    if (imageItem.canvasImageSource)
                        return;
                    if (typeof imageItem.src === 'string') {
                        var img_1 = new Image(imageItem.width, imageItem.height);
                        promises.push(new Promise(function (resolve, reject) {
                            img_1.onload = function () {
                                resolve(true);
                            };
                            img_1.onerror = function () {
                                reject(false);
                            };
                        }));
                        img_1.src = imageItem.src;
                        imageItem.canvasImageSource = img_1;
                    }
                });
            }
        });
        return Promise.allSettled(promises);
    };
    Controller.prototype._initRender = function () {
        if (!this.isInitRendered) {
            this._render();
            this.isInitRendered = true;
            this.autoStart();
        }
    };
    Controller.prototype._render = function () {
        var _this = this;
        var startRad = this.startRad;
        var endRad = 0;
        this.prizes.forEach(function (item) {
            endRad = _this.eachRad + startRad;
            // 绘制奖品块
            _this.ctx.beginPath();
            _this.ctx.moveTo(0, 0);
            _this.ctx.arc(0, 0, _this.radius, startRad, endRad);
            _this.ctx.fillStyle = item.background;
            _this.ctx.fill();
            _this.ctx.restore();
            _this.ctx.save();
            _this.ctx.rotate(startRad + (PI / 2) + (_this.eachRad / 2));
            _this.ctx.save();
            // 绘制文字
            item.texts.forEach(function (textItem) {
                _this.ctx.save();
                _this.ctx.translate(0, -(textItem.fromCenter) * _this.radius);
                _this.ctx.font = textItem.fontStyle;
                _this.ctx.fillStyle = textItem.fontColor || '#000000';
                _this.ctx.fillText(textItem.text, -_this.ctx.measureText(textItem.text).width / 2, 0, 100);
                _this.ctx.restore();
            });
            _this.ctx.restore();
            // 绘制图片
            if (Array.isArray(item.images)) {
                item.images.forEach(function (imageItem) {
                    if (imageItem.canvasImageSource) {
                        _this.ctx.save();
                        _this.ctx.translate(0, -(imageItem.fromCenter) * _this.radius);
                        _this.ctx.drawImage(imageItem.canvasImageSource, -imageItem.width / 2, 0, imageItem.width, imageItem.height);
                        _this.ctx.restore();
                    }
                });
            }
            _this.ctx.restore();
            _this.ctx.restore();
            _this.ctx.restore();
            startRad = endRad;
        });
        this.ctx.restore();
    };
    return Controller;
}());
exports.default = Controller;

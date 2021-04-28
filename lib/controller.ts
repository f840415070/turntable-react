// 兼容 window.requestAnimationFrame, window.cancelAnimationFrame
(function<T extends Record<string, any> & Window>(window: T) {
  let lastTime = 0;
  const vendors = ['webkit', 'moz'];
  for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[`${vendors[x]}RequestAnimationFrame`];
    window.cancelAnimationFrame = window[`${vendors[x]}CancelAnimationFrame`]
      || window[`${vendors[x]}CancelRequestAnimationFrame`];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      window.clearTimeout(id);
    };
  }
}(window));

const {
  PI,
  floor,
} = Math;
const {
  requestAnimationFrame,
  cancelAnimationFrame,
  setTimeout,
  clearTimeout,
  devicePixelRatio = 1,
} = window;

function checkOpts(opts: Partial<TurntableTypes.ControllerOpts>): TurntableTypes.ControllerOpts {
  return ({
    renderIfLoaded: opts.renderIfLoaded !== false,
    renderIfLoadedTimeout: (
      opts.renderIfLoadedTimeout && opts.renderIfLoadedTimeout > 0
    ) ? opts.renderIfLoadedTimeout : 300,
    onComplete: typeof opts.onComplete === 'function' ? opts.onComplete : () => {},
    pointToMiddle: opts.pointToMiddle || false,
    timeout: opts.timeout && opts.timeout > 0 ? opts.timeout : 10000,
    onTimeout: typeof opts.onTimeout === 'function' ? opts.onTimeout : () => {},
    auto: opts.auto !== false,
    autoSpeed: opts.autoSpeed && opts.autoSpeed > 0 && opts.autoSpeed < 6 ? opts.autoSpeed : 2,
    autoDelay: opts.autoDelay && opts.autoDelay >= 0 ? opts.autoDelay : 5000,
    turntableBackground: opts.turntableBackground ? opts.turntableBackground : 'transparent',
    duration: opts.duration && opts.duration >= 3000 ? opts.duration : 3000,
  });
}

class Controller {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private size: number;
  private prizes: TurntableTypes.Prize[];
  private radius: number;
  private startRad: number; // 起始弧度
  private eachRad: number; // 每个奖品块的平均弧度
  private rotateToPointerRads: number[]; // Array<从每个奖品块中点的弧度到指针指向中心的弧度值>
  private opts: TurntableTypes.ControllerOpts;
  private isInitRendered: boolean; // 初次渲染完成
  private _CURRENT_PRIZE_INDEX: number; // 中奖的索引
  private isAborted: boolean; // 中止转动
  private autoConf: {
    timer: number,
    rafHandle: number,
  }; // 自动旋转配置

  public isRotating: boolean;
  public ref: TurntableTypes.controllerRef;

  constructor(
    size: number,
    prizes: TurntableTypes.Prize[],
    opts: Partial<TurntableTypes.ControllerOpts>,
  ) {
    this.canvas = <HTMLCanvasElement> document.getElementById('__turntable-canvas');
    if (!this.canvas) {
      throw new Error('Can not get canvas element!');
    }

    this.ctx = <CanvasRenderingContext2D> this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Can not get canvas context!');
    }

    this.size = size;
    this.prizes = prizes;
    this.opts = checkOpts(opts);
    this.radius = size / 2;
    this.eachRad = 2 * PI / prizes.length;
    this.startRad = this._initStartRad;
    this.rotateToPointerRads = prizes.map((_, index) => {
      const rotateRad = 2 * PI + this.startRad - (this.eachRad * index + this.eachRad / 2);
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

  init() {
    this._resizeCanvas();
    this.ctx.translate(this.radius, this.radius);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, PI * 2);
    this.ctx.fillStyle = this.opts.turntableBackground;
    this.ctx.fill();
    this.ctx.restore();
    this.initRender();
  }

  _resizeCanvas() {
    this.canvas.style.width = `${this.size}px`;
    this.canvas.style.height = `${this.size}px`;
    this.canvas.width = floor(this.size * devicePixelRatio);
    this.canvas.height = floor(this.size * devicePixelRatio);
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  get _initStartRad() {
    return -PI / 2 - (this.opts.pointToMiddle ? (this.eachRad / 2) : 0);
  }

  get _nextStartRad() {
    return this.startRad + 0.116 * PI;
  }

  get currentPrizeIndex() {
    return this._CURRENT_PRIZE_INDEX;
  }

  setCurrentPrizeIndex(index: number) {
    if (index >= 0) {
      this._CURRENT_PRIZE_INDEX = index;
    }
  }

  abort() {
    this.isAborted = true;
  }

  _reset() {
    this.isRotating = false;
    this.isAborted = false;
    this._CURRENT_PRIZE_INDEX = -9999;
    this.ref.timeNode = +new Date();
  }

  reset() {
    this._reset();
    this.startRad = this._initStartRad;
  }

  finish() {
    this._reset();
    if (this.opts.auto) {
      this.autoStart();
    } else {
      this.startRad = this._initStartRad;
    }
  }

  rotate() {
    this.cancelAuto();
    this.isRotating = true;
    const runTime = +new Date();
    this._rotate(runTime);
    this.ref.timeNode = runTime;
  }

  _easeRotate(rotateRad: number) {
    this.startRad += (rotateRad - this.startRad) / 20;
    if (rotateRad - this.startRad <= 0.01) {
      this.opts.onComplete(this.currentPrizeIndex);
      this.finish();
      return;
    }
    this._render();
    requestAnimationFrame(() => {
      this._easeRotate(rotateRad);
    });
  }

  _rotate(startTime: number) {
    if (this.currentPrizeIndex >= 0
      && +new Date() - startTime > (this.opts.duration - 3000)
    ) {
      this.startRad = this._initStartRad;
      const rotateRad = this.rotateToPointerRads[this.currentPrizeIndex]
        + 40 * PI
        + (this.opts.pointToMiddle ? (this.eachRad / 2) : 0);
      this._easeRotate(rotateRad);
      return;
    }
    if (+new Date() - startTime > this.opts.timeout) {
      this.reset();
      this._render();
      this.opts.onTimeout();
      this.autoStart();
      return;
    }
    if (this.isAborted) {
      this.reset();
      this._render();
      this.autoStart();
      return;
    }

    this.startRad = this._nextStartRad;
    this._render();
    requestAnimationFrame(() => {
      this._rotate(startTime);
    });
  }

  autoStart() {
    if (this.opts.auto) {
      this.autoConf.timer = setTimeout(() => {
        this.autoRotate();
      }, this.opts.autoDelay);
    }
  }

  cancelAuto() {
    if (this.opts.auto) {
      clearTimeout(this.autoConf.timer);
      cancelAnimationFrame(this.autoConf.rafHandle);
      this.reset();
    }
  }

  autoRotate() {
    this.startRad += 0.0001 * (this.opts.autoSpeed + 5) * PI;
    this._render();
    this.autoConf.rafHandle = requestAnimationFrame(() => {
      this.autoRotate();
    });
  }

  initRender() {
    if (this.prizes.some((item) => !!item.images) && this.opts.renderIfLoaded) {
      // 等待所有图片都进入加载结束状态再绘制转盘
      // 避免因为图片未加载完，canvas drawImage 失败而导致图片没有绘制
      this.allImagesLoaded().then((_) => {
        this._initRender();
      });
      setTimeout(() => {
        this._initRender();
      }, this.opts.renderIfLoadedTimeout);
    } else {
      this._initRender();
    }
  }

  allImagesLoaded(): Promise<PromiseSettledResult<boolean>[]> {
    const promises: Promise<boolean>[] = [];
    this.prizes.forEach((item) => {
      if (Array.isArray(item.images) && item.images.length > 0) {
        item.images.forEach((imageItem) => {
          if (imageItem.canvasImageSource) return;
          if (typeof imageItem.src === 'string') {
            const img = new Image(imageItem.width, imageItem.height);
            promises.push(new Promise((resolve, reject) => {
              img.onload = function() {
                resolve(true);
              };
              img.onerror = function() {
                reject(false);
              };
            }));
            img.src = imageItem.src;
            imageItem.canvasImageSource = img;
          }
        });
      }
    });
    return Promise.allSettled(promises);
  }

  _initRender() {
    if (!this.isInitRendered) {
      this._render();
      this.isInitRendered = true;
      this.autoStart();
    }
  }

  _render() {
    let { startRad } = this;
    let endRad = 0;

    this.prizes.forEach((item) => {
      endRad = this.eachRad + startRad;
      // 绘制奖品块
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, this.radius, startRad, endRad);
      this.ctx.fillStyle = item.background;
      this.ctx.fill();
      this.ctx.restore();
      this.ctx.save();
      this.ctx.rotate(startRad + (PI / 2) + (this.eachRad / 2));
      this.ctx.save();
      // 绘制文字
      item.texts.forEach((textItem) => {
        this.ctx.save();
        this.ctx.translate(0, -(textItem.fromCenter) * this.radius);
        this.ctx.font = textItem.fontStyle;
        this.ctx.fillStyle = textItem.fontColor || '#000000';
        this.ctx.fillText(
          textItem.text,
          -this.ctx.measureText(textItem.text).width / 2,
          0,
          100,
        );
        this.ctx.restore();
      });
      this.ctx.restore();
      // 绘制图片
      if (Array.isArray(item.images)) {
        item.images.forEach((imageItem) => {
          if (imageItem.canvasImageSource) {
            this.ctx.save();
            this.ctx.translate(0, -(imageItem.fromCenter) * this.radius);
            this.ctx.drawImage(
              imageItem.canvasImageSource,
              -imageItem.width / 2,
              0,
              imageItem.width,
              imageItem.height,
            );
            this.ctx.restore();
          }
        });
      }
      this.ctx.restore();
      this.ctx.restore();
      this.ctx.restore();

      startRad = endRad;
    });
    this.ctx.restore();
  }
}

export default Controller;

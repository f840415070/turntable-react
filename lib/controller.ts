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
      clearTimeout(id);
    };
  }
}(window));

const {
  PI,
  floor,
} = Math;
const {
  requestAnimationFrame,
  devicePixelRatio = 1,
} = window;

function checkOpts(opts: Partial<TurntableTypes.ControllerOpts>): TurntableTypes.ControllerOpts {
  return ({
    renderIfLoaded: opts.renderIfLoaded !== false,
    renderIfLoadedTimeout: (
      opts.renderIfLoadedTimeout && opts.renderIfLoadedTimeout > 0
    ) ? opts.renderIfLoadedTimeout : 300,
    onComplete: opts.onComplete && typeof opts.onComplete === 'function' ? opts.onComplete : () => {},
    pointToMiddle: opts.pointToMiddle || false,
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

  public isRotating: boolean;

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
    console.log(this.opts);
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
  }

  init() {
    this._resizeCanvas();
    this.ctx.translate(this.radius, this.radius);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, PI * 2);
    this.ctx.fillStyle = 'transparent';
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

  reset() {
    this.isRotating = false;
    this.startRad = this._initStartRad;
    this._CURRENT_PRIZE_INDEX = -9999;
    this.isAborted = false;
  }

  rotate() {
    this.isRotating = true;
    this._rotate(+new Date());
  }

  _easeRotate(rotateRad: number) {
    this.startRad += (rotateRad - this.startRad) / 20;
    if (rotateRad - this.startRad <= 0.01) {
      this.opts.onComplete(this.currentPrizeIndex);
      this.reset();
      return;
    }
    this._render();
    requestAnimationFrame(() => {
      this._easeRotate(rotateRad);
    });
  }

  _rotate(startTime: number) {
    if (this.currentPrizeIndex >= 0) {
      this.startRad = this._initStartRad;
      const rotateRad = this.rotateToPointerRads[this.currentPrizeIndex]
        + 40 * PI
        + (this.opts.pointToMiddle ? (this.eachRad / 2) : 0);
      this._easeRotate(rotateRad);
      return;
    }
    if (this.isAborted) {
      this.reset();
      this._render();
      return;
    }

    this.startRad = this._nextStartRad;
    this._render();
    requestAnimationFrame(() => {
      this._rotate(startTime);
    });
  }

  initRender() {
    if ((this.prizes.some((item) => !!item.image)) && this.opts.renderIfLoaded) {
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
      if (item.image) {
        if (item.image.canvasImageSource) return;
        if (typeof item.image.src === 'string') {
          const img = new Image(item.image.width, item.image.height);
          promises.push(new Promise((resolve, reject) => {
            img.onload = function() {
              resolve(true);
            };
            img.onerror = function() {
              reject(false);
            };
          }));
          img.src = item.image.src;
          item.image.canvasImageSource = img;
        }
      }
    });
    return Promise.allSettled(promises);
  }

  _initRender() {
    if (!this.isInitRendered) {
      this._render();
      this.isInitRendered = true;
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
      this.ctx.fillStyle = item.backgroundColor;
      this.ctx.fill();
      this.ctx.restore();
      this.ctx.save();
      this.ctx.rotate(startRad + (PI / 2) + (this.eachRad / 2));
      this.ctx.save();
      // 绘制奖品文字
      this.ctx.translate(0, -0.7 * this.radius);
      this.ctx.font = item.fontStyle;
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(
        item.title,
        -this.ctx.measureText(item.title).width / 2,
        0,
        100,
      );
      this.ctx.restore();
      // 绘制奖品图片
      if (item.image && item.image.canvasImageSource) {
        this.ctx.translate(0, -0.6 * this.radius);
        this.ctx.drawImage(
          item.image.canvasImageSource,
          -item.image.width / 2,
          0,
          item.image.width,
          item.image.height,
        );
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

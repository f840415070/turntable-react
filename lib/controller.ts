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
} = Math;
const {
  requestAnimationFrame,
} = window;

function checkOpts(opts: Partial<TurntableTypes.ControllerOpts>): TurntableTypes.ControllerOpts {
  return ({
    afterImagesLoaded: opts.afterImagesLoaded !== false,
    afterImagesLoadedTimeout: (
      opts.afterImagesLoadedTimeout && opts.afterImagesLoadedTimeout > 0
    ) ? opts.afterImagesLoadedTimeout : 300,
    onComplete: opts.onComplete && typeof opts.onComplete === 'function' ? opts.onComplete : () => {},
    turns: opts.turns && opts.turns > 0 ? opts.turns : 20,
  });
}

class Controller {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private prizes: TurntableTypes.Prize[];
  private radius: number;
  private startRad: number; // 起始弧度
  private eachRad: number; // 每个奖品块的平均弧度
  private distanceToPointerRads: number[]; // Array<从每个奖品块中点的弧度到指针指向中心的弧度值>
  private opts: TurntableTypes.ControllerOpts;
  private isInitRendered: boolean; // 初次渲染完成

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

    this.prizes = prizes;
    this.opts = checkOpts(opts);
    console.log(this.opts);
    this.radius = size / 2;
    this.startRad = -PI / 2;
    this.eachRad = 2 * PI / prizes.length;
    this.distanceToPointerRads = prizes.map((_, index) => 1.5 * PI - (this.eachRad * index + this.eachRad / 2));
    this.isInitRendered = false;
    this.isRotating = false;
  }

  init() {
    this.ctx.translate(this.radius, this.radius);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, PI * 2);
    this.ctx.fillStyle = 'transparent';
    this.ctx.fill();
    this.ctx.restore();
    this.initRender();
  }

  rotate(targetIndex: number) {
    const distanceRad = this.distanceToPointerRads[targetIndex] + 2 * PI * this.opts.turns;
    this.isRotating = true;
    this._rotate(distanceRad, targetIndex);
  }

  _rotate(distanceRad: number, prizeIndex: number) {
    // this.startRad += 0.1 * PI;
    this.startRad += (distanceRad - this.startRad) / 20;
    if (distanceRad - this.startRad <= 0.01) {
      this.opts.onComplete(prizeIndex);
      this._reset();
      return;
    }
    this._render();
    requestAnimationFrame(() => {
      this._rotate(distanceRad, prizeIndex);
    });
  }

  _reset() {
    this.isRotating = false;
    this.startRad = -PI / 2;
  }

  initRender() {
    if ((this.prizes.some((item) => !!item.image)) && this.opts.afterImagesLoaded) {
      // 等待所有图片都进入加载结束状态再绘制转盘
      // 避免因为图片未加载完 canvas drawImage 失败导致图片没有绘制
      this.allImagesLoaded().then((_) => {
        this._renderIfNotRendered();
      });
      setTimeout(() => {
        this._renderIfNotRendered();
      }, this.opts.afterImagesLoadedTimeout);
    } else {
      this._renderIfNotRendered();
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

  _renderIfNotRendered() {
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

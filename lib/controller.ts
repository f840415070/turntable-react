const {
  PI,
} = Math;

class Controller {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private prizes: TurntableTypes.Prize[];
  private radius: number;
  private startRadian: number;
  private eachRadian: number;
  private midRadians: number[];
  private opts: TurntableTypes.ControllerOpts;

  constructor(size: number, prizes: TurntableTypes.Prize[], opts: TurntableTypes.ControllerOpts) {
    this.canvas = <HTMLCanvasElement>document.getElementById('__turntable-canvas');
    if (!this.canvas) {
      throw new Error('Can not get canvas element!');
    }

    this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Can not get canvas context!');
    }

    this.prizes = prizes;
    this.opts = opts;
    this.radius = size / 2;
    // 起始弧度
    this.startRadian = -PI / 2;
    // 每个奖品块的平均弧度
    this.eachRadian = 2 * PI / prizes.length;
    // Array<从起始弧度到每个奖品块中点的弧度值>
    this.midRadians = prizes.map((_, index) => (this.eachRadian * index) + (this.eachRadian / 2));
  }

  init() {
    this.ctx.translate(this.radius, this.radius);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, PI * 2);
    this.ctx.fillStyle = 'transparent';
    this.ctx.fill();
    this.ctx.restore();

    // 等待所有图片都进入加载结束状态再绘制转盘
    // 避免因为图片未加载完 canvas drawImage 失败导致图片没有绘制
    if (this.prizes.some((item) => !!item.image)) {
      this.allImagesLoaded().then((_) => {
        this.render();
      });
    } else {
      this.render();
    }
  }

  // 奖品旋转到指针指向位置的弧度距离
  toPointerRadian(targetIndex: number) {
    return 2 * PI - this.midRadians[targetIndex];
  }

  render() {
    let { startRadian } = this;
    let endRadian = 0;

    this.prizes.forEach((item) => {
      endRadian = this.eachRadian + startRadian;
      // 绘制奖品块
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, this.radius, startRadian, endRadian);
      this.ctx.fillStyle = item.backgroundColor;
      this.ctx.fill();
      this.ctx.restore();
      this.ctx.save();
      this.ctx.rotate(startRadian + (PI / 2) + (this.eachRadian / 2));
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

      startRadian = endRadian;
    });
    this.ctx.restore();
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
}

export default Controller;

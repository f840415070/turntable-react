const {
  PI,
} = Math;

class Controller {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private size: number;
  private prizes: TurntableTypes.Prize[];
  private startRadian: number;
  private eachRadian: number;
  private midRadians: number[];

  constructor(size: number, prizes: TurntableTypes.Prize[]) {
    this.canvas = document.getElementById('__turntable-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('Can not get canvas element!');
    }

    this.ctx = this.canvas.getContext && this.canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!this.ctx) {
      throw new Error('Can not get canvas context!');
    }

    this.size = size;
    this.prizes = this.prizeImageWrap(prizes);
    // 起始弧度
    this.startRadian = -PI / 2;
    // 每个奖品块的平均弧度
    this.eachRadian = 2 * PI / prizes.length;
    // Array<每个奖品块到该块中心的弧度>
    this.midRadians = prizes.map((_, index) => (this.eachRadian * index) + (this.eachRadian / 2));
  }

  get radius() {
    return this.size / 2;
  }

  init() {
    this.ctx.translate(this.radius, this.radius);
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.radius, 0, PI * 2);
    this.ctx.fillStyle = 'transparent';
    this.ctx.fill();
    this.ctx.restore();
    this.render();
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

  prizeImageWrap(prizes: TurntableTypes.Prize[]): TurntableTypes.Prize[] {
    return prizes.map((item) => {
      if (item.image) {
        if (item.image.canvasImageSource) return item;
        if (typeof item.image.src === 'string') {
          const img = new Image(item.image.width, item.image.height);
          img.src = item.image.src;
          item.image.canvasImageSource = img;
          return item;
        }
      }
      return item;
    });
  }
}

export default Controller;

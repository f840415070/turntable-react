const {
  PI,
} = Math;
// 角度转弧度
const toRadian = (degress: number): number => degress * PI / 180;

class Controller {
  private size: number;
  private prizes: TurntableTypes.Prize[];
  private canvas: HTMLCanvasElement | null;
  private ctx: CanvasRenderingContext2D | null;
  private startRadian: number;
  private eachRadian: number;

  constructor(size: number, prizes: TurntableTypes.Prize[]) {
    this.size = size;
    this.prizes = this.prizeImageWrapper(prizes);
    this.canvas = null;
    this.ctx = null;
    this.eachRadian = toRadian(360 / prizes.length);
    this.startRadian = toRadian(-90);
  }

  get radius() {
    return this.size / 2;
  }

  getCanvas(): HTMLCanvasElement {
    if (this.canvas) return this.canvas;
    this.canvas = document.getElementById('__turntable') as HTMLCanvasElement;
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    if (this.ctx) return this.ctx;
    const canvas = this.getCanvas();
    const ctx = canvas && canvas.getContext && canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas element or canvas context!');
    }
    return ctx;
  }

  init() {
    const ctx = this.getContext();
    ctx.translate(this.radius, this.radius);
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, PI * 2);
    ctx.fillStyle = 'transparent';
    ctx.fill();
    ctx.restore();
    this.render();
  }

  render() {
    this.paintPrizes();
  }

  paintPrizes() {
    const ctx = this.getContext();
    let { startRadian } = this;
    let endRadian = 0;

    this.prizes.forEach((item) => {
      endRadian = this.eachRadian + startRadian;

      // 绘制奖品块
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, this.radius, startRadian, endRadian);
      ctx.fillStyle = item.backgroundColor;
      ctx.fill();
      ctx.restore();
      ctx.save();

      ctx.rotate(startRadian + (PI / 2) + (this.eachRadian / 2));
      ctx.save();
      // 绘制奖品文字
      ctx.translate(0, -0.7 * this.radius);
      ctx.font = item.fontStyle;
      ctx.fillStyle = '#000000';
      ctx.fillText(
        item.title,
        -ctx.measureText(item.title).width / 2,
        0,
        100,
      );
      ctx.restore();

      // 绘制奖品图片
      if (item.createdImg && item.image) {
        ctx.translate(0, -0.6 * this.radius);
        ctx.drawImage(
          item.createdImg,
          -item.image.width / 2,
          0,
          item.image.width,
          item.image.height,
        );
      }
      ctx.restore();
      ctx.restore();

      startRadian = endRadian;
    });
    ctx.restore();
  }

  prizeImageWrapper(prizes: TurntableTypes.Prize[]): TurntableTypes.Prize[] {
    return prizes.map((item) => {
      if (item.image) {
        const img = new Image(item.image.width, item.image.height);
        img.src = item.image.src;
        item.createdImg = img;
        return item;
      }
      return item;
    });
  }
}

export default Controller;

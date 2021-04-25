declare namespace TurntableTypes {
  interface PrizeImage {
    src?: string,
    canvasImageSource?: CanvasImageSource,
    width: number,
    height: number,
  }

  interface Prize {
    title: string,
    backgroundColor: string,
    fontStyle: string,
    fontColor?: string,
    image?: PrizeImage | null,
  }

  interface ControllerOpts {
    onComplete: (prizeIndex: number) => void,
    afterImagesLoaded: boolean,
    afterImagesLoadedTimeout: number,
    turns: number,
    pointToCenter: boolean,
  }

  interface Props extends Partial<ControllerOpts> {
    size: number,
    prizes: Prize[],
    onStart: () => Promise<number>
    children?: React.ReactNode,
  }
}

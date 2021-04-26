/* eslint-disable no-unused-vars */
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
    timeout: number,
    onTimeout: () => void,
    renderIfLoaded: boolean,
    renderIfLoadedTimeout: number,
    pointToMiddle: boolean,
  }

  interface Props extends Partial<ControllerOpts> {
    size: number,
    prizes: Prize[],
    onDraw: (abort: () => void) => Promise<number>,
    children?: React.ReactNode,
  }

  type controllerRef = {timeNode: number}
}

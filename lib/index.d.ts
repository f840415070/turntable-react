/* eslint-disable no-unused-vars */
declare namespace TurntableTypes {
  interface PrizeImage {
    src?: string,
    canvasImageSource?: CanvasImageSource,
    width: number,
    height: number,
    fromCenter: number,
  }

  interface PrizeText {
    text: string,
    fontStyle: string,
    fontColor?: string,
    fromCenter: number,
  }

  interface Prize {
    texts: PrizeText[],
    background: string,
    images?: PrizeImage[],
  }

  interface ControllerOpts {
    duration: number,
    onComplete: (prizeIndex: number) => void,
    timeout: number,
    onTimeout: () => void,
    auto: boolean,
    autoSpeed: number,
    autoDelay: number,
    renderIfLoaded: boolean,
    renderIfLoadedTimeout: number,
    pointToMiddle: boolean,
    turntableBackground: string,
  }

  interface Props extends Partial<ControllerOpts> {
    size: number,
    prizes: Prize[],
    onStart: (abort: () => void) => Promise<number> | false,
    children?: React.ReactNode,
  }

  type controllerRef = {timeNode: number}
}

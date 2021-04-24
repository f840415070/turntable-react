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
    renderAfterImagesLoaded?: boolean,
  }

  interface Props extends ControllerOpts {
    size: number,
    prizes: Prize[],
    onPress: (...args: any[]) => Promise<number>
    children?: React.ReactNode,
  }
}

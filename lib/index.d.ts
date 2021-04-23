declare namespace TurntableTypes {
  interface PrizeImage {
    src: string,
    width: number,
    height: number,
  }

  interface Prize {
    title: string,
    backgroundColor: string,
    fontStyle: string,
    fontColor?: string,
    image?: PrizeImage,
    createdImg?: HTMLOrSVGImageElement,
  }

  interface Props {
    size: number,
    prizes: Prize[],
  }
}

# turntable-react
> 基于 React 和 canvas 的抽奖转盘组件，支持动态启动（不必等待接口返回中奖信息再转动）、超时控制、转盘绘制多行文本与图片、自定义指针样式

## 使用
`npm install turntable-react`

## <span id="example">example</span>:
```ts
import Turntable from 'turntable-react';

<Turntable
    size={360}
    prizes={testPrizes}
    onStart={fetchPrizeResult}
    onComplete={complete}
    onTimeout={timeout}
    >
    {/* 转盘指针 点击按钮 */}
    <div className="turntable-pointer">
        <img className="pointer-img" src={require('./pointer.png')} alt="" />
    </div>
</Turntable>
```

## Turntable Props

| propName | type | desc | required | default |<br>
| :-: | :-: | :-: | :-: | :-: | :-: |
| size | number | 转盘大小，数值，像素单位 | true | - |
| prizes | [Prize[]](#Prize) | 奖品数据 | true | - |
| onStart | (abort: () => void) => Promise<number> or false | 点击指针时执行的函数，请求的中奖数据的接口可以写在 Promise 中并返回；返回 Promise 对象时，resolve 奖品在 prizes 里的索引，返回 false 时，转盘不会启动；在转盘转动时可使用 abort 函数主动中止转动 | true | - |
| children | React.ReactNode | 转盘指针，点击按钮的自定义样式，被 Turntable 组件包裹的子代节点，如 [example](#example) | false | - |
| onComplete | (prizeIndex: number) => void | 抽奖结束即转盘停止转动后执行的回调函数，组件传递的参数是中奖的索引 | false | - |
| timeout | number | 超时时间，毫秒 | false | 10000 |
| onTimeout | () => void | 超时执行的回调 | false | - |
| auto | boolean | 初始化后没有被点击，转盘将匀速自动转动 | false | true
| autoSpeed | number | 自动转动的速度，取值范围 [1, 5] | false | 2 |
| autoDelay | number | 初始化后多少毫秒没有被点击将自动转动 | false | 2000 |
| renderIfLoaded | boolean | 如果有图片需要绘制，组件会等待图片加载完成后才绘制转盘（图片没有下载完，canvas drawImage 会失败）| false | true |
| renderIfLoadedTimeout | number | 开启 renderIfLoaded 后，若指定时间没有加载完所有图片，将不会等待直接绘制转盘。单位毫秒 | false | 300 |
| pointToMiddle | boolean | 转盘指针指向第一个奖品正中心，而不是第一个与最后一个间隙 | false | false |
| turntableBackground | string | 转盘背景色 | false | transparent |

## Turntable sub types

### <span id="Prize">Prize</span>

| propName | type | desc | required | default |<br>
| :-: | :-: | :-: | :-: | :-: | :-: |
| texts | [PrizeText[]](#PrizeText) | 待绘制文本数组 | true | - |
| background | string | 奖品块的背景色 | true | - |
| images | [PrizeImage[]](#PrizeImage) | 待绘制的图片数组 | false | - |

### <span id="PrizeText">PrizeText</span>

| propName | type | desc | required | default |<br>
| :-: | :-: | :-: | :-: | :-: | :-: |
| text | string | 文本 | true | - |
| fontStyle | string | 与css font 属性相同，注意要传入默认字体，如 '16px Arial' | true | - |
| fontColor | string | 字体颜色 | false | #000000 |
| fromCenter | number | 文字距中心位置距离，取值范围 [0, 1] | true | - |

### <span id="PrizeImage">PrizeImage</span>

| propName | type | desc | required | default |<br>
| :-: | :-: | :-: | :-: | :-: | :-: |
| src | string | 图片链接，可选(与 canvasImageSource 二选一)，使用 src 属性，组件将 `new Image()` 创建 img 对象，对图片有其它需求的可以自己创建图片对象到 canvasImageSource  | false | - |
| canvasImageSource | CanvasImageSource | 自行创建 canvas 支持的图片对象 `type CanvasImageSource = HTMLOrSVGImageElement HTMLVideoElement HTMLCanvasElement ImageBitmap OffscreenCanvas;` | false | - |
| width | number | 图片宽度 | true | - |
| height | number | 图片高度 | true | - |
| fromCenter | number | 图片距中心位置距离，取值范围 [0, 1] | true | - |

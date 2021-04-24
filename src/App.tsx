import React from 'react';
import Turntable from '../lib/turntable';
import './App.css';

const testColors: string[] = [
  '#62CDD8', '#FFFFFF', '#FEB446', '#FFFFFF', '#62CDD8', '#FFFFFF', '#FEB446', '#FFFFFF',
];
const testPrizes: TurntableTypes.Prize[] = Array(8).fill(0).map((_, index) => ({
  title: index === 0 ? '谢谢参与' : `${(index + 1) * 1000}元大奖`,
  backgroundColor: testColors[index],
  fontStyle: '16px Arial',
  image: index === 0 ? null : ({
    src: '../src/gift.png',
    width: 30,
    height: 30,
  }),
}));

function App() {
  const getPrizeResult = () => {
    return new Promise<number>((resolve, reject) => {
      const testResult = Math.floor(Math.random() * 8);
      if (testResult >= 7) { // 未达条件不启动抽奖
        reject();
      }
      // setTimeout 模拟接口请求结果
      setTimeout(() => {
        resolve(testResult);
      }, 50);
    });
  };

  return (
    <div className="turntable">
      <Turntable
        size={360}
        prizes={testPrizes}
        onPress={getPrizeResult}
        renderAfterImagesLoaded={true}
      >
        {/* 转盘指针 点击按钮 */}
        <div className="turntable-pointer">
          <img className="pointer-img" src={require('./pointer.png')} alt="" />
        </div>
      </Turntable>
    </div>
  );
}

export default App;

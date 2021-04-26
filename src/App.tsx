import React from 'react';
import Turntable from '../lib/turntable';
import './App.css';

const testColors: string[] = [
  '#62CDD8', '#FFFFFF', '#FEB446', '#FFFFFF', '#62CDD8', '#FFFFFF', '#FEB446', '#FFFFFF',
];
const testPrizes: TurntableTypes.Prize[] = Array(8).fill(0).map((_, index) => ({
  title: index === 0 ? '谢谢参与' : `${index * 1000}元大奖`,
  backgroundColor: testColors[index],
  fontStyle: '16px Arial',
  image: index === 0 ? null : ({
    src: '../src/gift.png',
    width: 30,
    height: 30,
  }),
}));

function App() {
  const canStart = true;
  const getPrizeResult = (abort: () => void) => {
    return new Promise<number>((resolve, reject) => {
      if (!canStart) { // 未达条件不启动抽奖
        reject();
      }
      // setTimeout 模拟接口请求结果
      setTimeout(() => {
        const resultPrizeIndex = Math.floor(Math.random() * 8);
        if (!canStart) { // 未达条件不启动抽奖
          reject();
        } else {
          resolve(resultPrizeIndex);
        }
      }, 2000);
      setTimeout(() => {
        abort();
      }, 1000);
    });
  };

  const complete = (index: number) => {
    console.log(`恭喜你抽中 - ${testPrizes[index].title}！`);
  };

  return (
    <div className="turntable">
      <Turntable
        size={360}
        prizes={testPrizes}
        onStart={getPrizeResult}
        onComplete={complete}
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

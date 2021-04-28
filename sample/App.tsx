import React from 'react';
import Turntable from '../lib/turntable';
import './App.css';

const prizeBackgrounds: string[] = [
  '#62CDD8', '#FFFFFF', '#FEB446', '#FFFFFF',
  '#62CDD8', '#FFFFFF', '#FEB446', '#FFFFFF',
];
const prizes = Array(8).fill(0).map((_, index) => ({
  texts: index === 0 ? [
    {
      text: '谢谢', fontStyle: '13px Arial', fontColor: 'rgba(70, 47, 47, 1)', fromCenter: 0.8,
    },
    {
      text: '参与', fontStyle: '13px Arial', fontColor: 'rgba(70, 47, 47, 1)', fromCenter: 0.68,
    },
  ] : [
    {
      text: '奖品价值', fontStyle: '13px Arial', fontColor: 'rgba(70, 47, 47, 1)', fromCenter: 0.8,
    },
    {
      text: `${index * 1000}元`, fontStyle: '13px Arial', fontColor: 'rgba(255, 40, 40, 1)', fromCenter: 0.68,
    },
  ],
  background: prizeBackgrounds[index],
  images: index === 0 ? undefined : [
    {
      src: '../sample/gift.png',
      width: 25,
      height: 25,
      fromCenter: 0.65,
    },
  ],
}));

function App() {
  const canStart = true;

  const toast = (msg: string) => {
    console.log(msg);
  };

  const fetchPrizeResult = (abort: () => void) => {
    if (!canStart) { // 未达条件不启动抽奖
      toast('no times!');
      return false;
    }
    return new Promise<number>((resolve, reject) => {
      // setTimeout 模拟接口请求抽奖结果
      setTimeout(() => {
        const resultPrizeIndex = Math.floor(Math.random() * 8);
        if (resultPrizeIndex < 0) { // 未达条件不启动抽奖
          reject();
          toast('something is wrong!');
        } else {
          resolve(resultPrizeIndex);
        }
      }, 60);
    });
  };

  const complete = (index: number) => {
    console.log(`恭喜你抽中 - ${[index]} `, prizes[index]);
  };

  const timeout = () => {
    console.log('已超时');
  };

  return (
    <div className="turntable">
      <Turntable
        size={268}
        prizes={prizes}
        onStart={fetchPrizeResult}
        onComplete={complete}
        onTimeout={timeout}
        mode="waiting"
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

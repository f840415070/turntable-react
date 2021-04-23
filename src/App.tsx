import React from 'react';
import Turntable from '../lib/turntable';

function App() {
  const testColor: string[] = ['red', 'orange', 'yellow', 'green', 'gray', '#6edbe6', 'purple', '#AED54C'];
  const prizes: TurntableTypes.Prize[] = Array(8).fill(0).map((_, index) => ({
    title: `${(index + 1) * 1000}元大奖`,
    backgroundColor: testColor[index],
    fontStyle: '14px',
    image: {
      src: '../src/gift.png',
      width: 30,
      height: 30,
    },
  }));

  return (
    <div
      className="turntable-container"
      style={{ width: 360, height: 360, margin: 'auto' }}
    >
      <Turntable size={360} prizes={prizes} />
    </div>
  );
}

export default App;

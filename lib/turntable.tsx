import React, { useEffect } from 'react';
import Controller from './controller';

function Turntable({ size, prizes }: TurntableTypes.Props) {
  const controller = new Controller(size, prizes);
  useEffect(() => {
    console.log('转盘开始渲染');
    controller.init();
  }, []);

  return (
    <canvas id="__turntable" width={size} height={size}>
      You need to update your browser because canvas is not supported.
    </canvas>
  );
}

export default Turntable;

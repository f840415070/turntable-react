import React, { FC, useEffect } from 'react';
import Controller from './controller';

const Turntable: FC<TurntableTypes.Props> = (props: TurntableTypes.Props) => {
  const {
    size,
    prizes,
    children,
    onStart,
    ...opts
  } = props;

  let controller: Controller;
  useEffect(() => {
    controller = new Controller(size, prizes, opts);
    controller.init();
  }, []);

  // 启动抽奖
  const start = () => {
    if (controller.isRotating) return;
    onStart()
      .then((res) => {
        console.log(res);
        controller.rotate(res);
      })
      .catch(() => {});
  };

  return (
    <div
      className="__turntable-container"
      style={{ position: 'relative' }}
    >
      <canvas id="__turntable-canvas" width={size} height={size}>
        You need to update your browser to support canvas.
      </canvas>
      <div
        className="__turntable-over-box"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="__turntable-pointer" onClick={start}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Turntable;

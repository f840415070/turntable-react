import React, { FC, useEffect } from 'react';
import Controller from './controller';

const Turntable: FC<TurntableTypes.Props> = (props: TurntableTypes.Props) => {
  const {
    size,
    prizes,
    children,
    onDraw,
    ...opts
  } = props;

  let controller: Controller;

  useEffect(() => {
    controller = new Controller(size, prizes, opts);
    controller.init();
  }, []);

  const drawing = (startTime: number) => {
    onDraw(controller.abort.bind(controller))
      .then((index) => {
        if (startTime === controller.ref.timeNode) {
          console.log(index);
          controller.setCurrentPrizeIndex(index);
        } else {
          console.warn(index, '时间已过');
        }
      })
      .catch(() => {});
  };

  const run = () => {
    if (controller.isRotating) return;
    controller.reset();
    controller.rotate();
    drawing(controller.ref.timeNode);
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
        <div className="__turntable-pointer" onClick={run}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Turntable;

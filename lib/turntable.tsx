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

  const drawing = (fetchResult: Promise<number>, startTime: number) => {
    fetchResult
      .then((index) => {
        if (startTime === controller.ref.timeNode) {
          controller.setCurrentPrizeIndex(index);
        }
      })
      .catch(() => {
        controller.abort();
      });
  };

  const drawingAfterGotResult = (fetchResult: Promise<number>, startTime: number) => {
    controller.changeState(true);
    controller.recordTimeout(startTime);
    fetchResult
      .then((index) => {
        if (startTime === controller.ref.timeNode) {
          controller.setCurrentPrizeIndex(index);
          controller.rotate();
        }
      })
      .catch(() => {
        controller.abort();
      });
  };

  const run = () => {
    if (controller.isDrawing) return;
    const startResult = onStart(controller.abort.bind(controller));
    if (startResult instanceof Promise) {
      controller.reset();
      if (controller.opts.mode === 'immediate') {
        controller.rotate();
        drawing(startResult, controller.ref.timeNode);
      } else {
        drawingAfterGotResult(startResult, controller.ref.timeNode);
      }
    }
  };

  return (
    <div
      className="__turntable-container"
      style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}
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
          width: `${size}px`,
          height: `${size}px`,
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

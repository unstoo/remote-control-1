import { mouse, left, right, up, down, Button, Point, straightTo } from "@nut-tree/nut-js";

export type Router = {
  [key: string]: (args: any) => Promise<void>
};

const actions: Router = {
  'mouse_up': async (args: number[]) => {
    await mouse.move(up(args[0]));
  },
  'mouse_down': async (args: number[]) => {
    await mouse.move(down(args[0]))
  },
  'mouse_left': async (args: number[]) => {
    await mouse.move(left(args[0]));
  },
  'mouse_right': async (args: number[]) => {
    await mouse.move(right(args[0]));
  },
  'draw_circle': async (args: number[]) => {
    const postion = await mouse.getPosition();
    const points = [];
    for (let angle = 0; angle <= 360; angle += 3) {
      const rad = angle * (Math.PI / 180)
      const x = (postion.x - args[0]) + args[0] * Math.cos(rad);
      const y = postion.y + args[0] * Math.sin(rad);
      points.push([x, y]);
    }
    
    await mouse.pressButton(Button.LEFT);
    for await (const [x, y] of points) {
      const p = new Point(x, y)
      await mouse.move(straightTo(p));
    }
    await mouse.releaseButton(Button.LEFT);
  },
  'draw_square': async (args: number[]) => {
    const defaultSpeed = mouse.config.mouseSpeed;
    mouse.config.mouseSpeed = args[0];
    await mouse.pressButton(Button.LEFT);
    await mouse.move(right(args[0]));
    await mouse.move(down(args[0]));
    await mouse.move(left(args[0]));
    await mouse.move(up(args[0]));
    await mouse.releaseButton(Button.LEFT);
    mouse.config.mouseSpeed = defaultSpeed;
  },
  'draw_rectangle': async (args: number[]) => {
    const defaultSpeed = mouse.config.mouseSpeed;
    mouse.config.mouseSpeed = args[1] + args[0];
    await mouse.pressButton(Button.LEFT);
    await mouse.move(down(args[0]));
    await mouse.move(left(args[1]));
    await mouse.move(up(args[0]));
    await mouse.move(right(args[1]));
    await mouse.releaseButton(Button.LEFT);
    mouse.config.mouseSpeed = defaultSpeed;
  },
};

export const remoteController = async (data: string) => {
  const [name, ...args] = data.split(' ');
  const parsedArgs = args.map(Number);
  const action = actions[name];
  if (action === undefined) {
    return {
      error: true,
    };
  }
  await action(parsedArgs);
  return {
    error: false,
  };
};

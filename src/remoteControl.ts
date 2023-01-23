import { mouse, left, right, up, down, Button, Point, straightTo, screen, Region } from "@nut-tree/nut-js";
import Jimp from 'jimp'

type Return = {
  answer?: string;
  file?: string;
}
export type Router = {
  [key: string]: (args: number[]) => Promise<Return>
};

const actions: Router = {
  'mouse_up': async (args) => {
    await mouse.move(up(args[0]));
    return {};
  },
  'mouse_down': async (args) => {
    await mouse.move(down(args[0]));
    return {};
  },
  'mouse_left': async (args) => {
    await mouse.move(left(args[0]));
    return {};
  },
  'mouse_right': async (args) => {
    await mouse.move(right(args[0]));
    return {};
  },
  'draw_circle': async (args) => {
    const pos = await mouse.getPosition();
    const points = [];
    for (let angle = 0; angle <= 360; angle += 3) {
      const rad = angle * (Math.PI / 180)
      const x = (pos.x - args[0]) + args[0] * Math.cos(rad);
      const y = pos.y + args[0] * Math.sin(rad);
      points.push([x, y]);
    }
    
    await mouse.pressButton(Button.LEFT);
    for await (const [x, y] of points) {
      const p = new Point(x, y)
      await mouse.move(straightTo(p));
    }
    await mouse.releaseButton(Button.LEFT);
    return {};
  },
  'draw_square': async (args) => {
    const defaultSpeed = mouse.config.mouseSpeed;
    mouse.config.mouseSpeed = args[0];
    await mouse.pressButton(Button.LEFT);
    await mouse.move(right(args[0]));
    await mouse.move(down(args[0]));
    await mouse.move(left(args[0]));
    await mouse.move(up(args[0]));
    await mouse.releaseButton(Button.LEFT);
    mouse.config.mouseSpeed = defaultSpeed;
    return {};
  },
  'draw_rectangle': async (args) => {
    const defaultSpeed = mouse.config.mouseSpeed;
    mouse.config.mouseSpeed = args[1] + args[0];
    await mouse.pressButton(Button.LEFT);
    await mouse.move(down(args[0]));
    await mouse.move(left(args[1]));
    await mouse.move(up(args[0]));
    await mouse.move(right(args[1]));
    await mouse.releaseButton(Button.LEFT);
    mouse.config.mouseSpeed = defaultSpeed;
    return {};
  },
  'mouse_position': async () => {
    const { x, y } = await mouse.getPosition();
    return { answer: `mouse_position ${x},${y}` };
  },
  'prnt_scrn': async () => {
    const { x, y } = await mouse.getPosition();
    const prefix = 'data:image/png;base64,';
    const region = new Region(x, y, 200, 200);
    let image;
    try {
      image = await (await screen.grabRegion(region)).toRGB();
    } catch (err) {
      return {
        error: true
      }
    }

    // Couldn't find types for this type of constructor :(
    // Jimp.read(buffer) crashes on my mac, thus using this signature instead
    // @ts-ignore
    const jimp = await Jimp.read({
      data: image.data,
      width: image.width,
      height: image.height
    });
    const base = await jimp.getBase64Async(Jimp.MIME_PNG);
    
    return { file: base.slice(prefix.length) };
  },
};

type Controller = (data: string) => Promise<{
  error: boolean;
  answer?: string;
  file?: string;
}>

export const remoteController: Controller = async (data: string) => {
  const [name, ...args] = data.split(' ');
  const parsedArgs = args.map(Number);
  const action = actions[name];
  if (!action) {
    return {
      error: true,
    };
  }
  const result = await action(parsedArgs);
  return {
    error: false,
    ...result,
  };
};

import { mouse, left, right, up, down } from "@nut-tree/nut-js";

export type Router = {
  [key: string]: (args: any) => Promise<void>
};

const actions: Router = {
  'mouse_up': async (value: number) => {
    await mouse.move(up(value));
  },
  'mouse_down': async (value: number) => {
    await mouse.move(down(value))
  },
  'mouse_left': async (value: number) => {
    await mouse.move(left(value));
  },
  'mouse_right': async (value: number) => {
    await mouse.move(right(value));
  },
};

export const remoteController = async (data: string) => {
  const [name, arg] = data.split(' ');
  const action = actions[name];
  if (action === undefined) {
    return {
      error: true,
      result: 'failure',
    };
  }
  await action(Number(arg));
  return {
    error: false,
    result: 'success',
  };
};

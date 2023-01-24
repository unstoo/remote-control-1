import { actions } from './router';

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

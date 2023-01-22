import { WebSocketServer } from 'ws';



export const createWsServer = (
  PORT: number,
  wsController: (data: string) => Promise<{
    error: boolean;
    answer?: string;
  }>
) => {
  const wss = new WebSocketServer({
    port: PORT || 8080,
  });
  
  wss.on('connection', function connection(ws) {
    ws.on('message', async function message(data) {
      const parsedData = data.toString();
      process.stdout.write('received: ' + parsedData + '\n');
      const { error, answer } = await wsController(parsedData);
      if (error) {
        ws.send(parsedData);
        process.stderr.write('failed: ' + parsedData + '\n');
      } else {
        answer && ws.send(answer);
      }
    });
  });
  
  wss.on('error', (error) => {
    process.stderr.write('websocket error: ' + error);
  });

  return wss;
};

import { EOL } from 'node:os';
import WebSocket from 'ws';


export const createWsServer = (
  PORT: number,
  wsController: (data: string) => Promise<{
    error: boolean;
    answer: string | void;
  }>
) => {
  (new WebSocket.Server({ port: PORT })).on('connection', function (ws) {
    const duplex = WebSocket.createWebSocketStream(ws, { 
      encoding: 'utf8',
      decodeStrings: false,
    });

    duplex.on('data', async (data) => {
        const { error, answer } = await wsController(data);

        if (error) {
          duplex.write('error' + EOL)
        } else if (answer) {
          duplex.write(answer + EOL)
        } else {
          duplex.write(data + EOL)
        }
    });
  });
};

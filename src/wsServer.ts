import { EOL } from 'node:os';
import WebSocket from 'ws';


export const createWsServer = (
  PORT: number,
  wsController: (data: string) => Promise<{
    error: boolean;
    answer?: string;
    file?: string;
  }>
) => {
  (new WebSocket.Server({ port: PORT })).on('connection', function (ws) {
    const duplex = WebSocket.createWebSocketStream(ws, { 
      encoding: 'utf8',
      decodeStrings: false,
    });

    duplex.on('data', async (data) => {
        const { error, answer, file } = await wsController(data);

        if (error) {
          duplex.write('error' + EOL)
        } else if (answer) {
          duplex.write(answer)
        } else if (file) {
          duplex.write('prnt_scrn ' + file)
        } else {
          duplex.write(data + EOL)
        }
    });
  });
};

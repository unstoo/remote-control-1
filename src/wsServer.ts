import { WebSocketServer } from 'ws';



export const createWsServer = (
  PORT: number,
  wsController: (data: string) => Promise<{
    error: boolean;
    result: string;
  }>
) => {
  const wss = new WebSocketServer({
    port: PORT || 8080,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024 // Size (in bytes) below which messages
      // should not be compressed if context takeover is disabled.
    }
  });
  
  wss.on('connection', function connection(ws) {
    ws.on('message', async function message(data) {
      const parsedData = data.toString();
      process.stdout.write('received: ' + parsedData + '\n');
      const { error, result } = await wsController(parsedData);
      if (error) {
        ws.send('failed: ' + parsedData);
        process.stderr.write('failed: ' + parsedData + '\n');
      } else {
        ws.send('success: ' + result);
      }
    });
  });
  
  wss.on('error', (error) => {
    process.stderr.write('websocket error: ' + error);
  });

  return wss;
};

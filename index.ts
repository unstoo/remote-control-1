import * as dotenv from 'dotenv';
dotenv.config();
import { httpServer } from "./src/http_server/httpServer";
import { createWsServer } from "./src//wsServer";
import { remoteController } from "./src/remoteControl";

const HTTP_PORT = process.env.HTTP_PORT;
const WS_PORT = Number(process.env.WS_PORT) || 8181;

process.stdout.write(`Start websocket server on the ${WS_PORT} port!\n`);
createWsServer(WS_PORT, remoteController);
process.stdout.write(`Start static http server on the ${HTTP_PORT} port!\n`);
httpServer.listen(HTTP_PORT);
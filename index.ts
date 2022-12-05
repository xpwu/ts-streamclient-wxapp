
import {Client, WebSocket, Option} from "ts-streamclient-base"
import {WxWebSocket} from "./src/websocket"

export function NewClient(wss: string, ...opf: Option[]): Client {
  opf.push(WebSocket(WxWebSocket))
  return new Client(wss, ...opf)
}

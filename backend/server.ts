import express from "express";
import http from "http";
import {WebSocketServer} from "ws";

const app = express();
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
app.post("/twiml", (req, res) => {
  console.log(req.headers.host)
  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Connect>
        <Stream url="wss://${req.headers.host}/"/>
      </Connect>
      <Say>H</Say>
      <Pause length="600"/>
    </Response>
  `);
});
const PORT = 8000;
server.listen(PORT, () => {
  console.log("LISTENING ON PORT: ", PORT)
});
//set 5mins
server.setTimeout(300000);

//handling websocket
wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message: string) {
    try {
      const msg = JSON.parse(message);
      const stream_sid = msg["streamSid"]
      switch (msg.event) {
        case "connected":
          console.log("connected")
          break;
        case "start":
          console.log("started")
          break;
        case "media":
          console.log("media")
          const audioBuffer = Buffer.from(msg.media.payload, "base64");
          console.log("streamSID", stream_sid);
          console.log("Input len", audioBuffer.length);
          let json_query = {
            "event": "media",
            "streamSid": stream_sid,
            "media": {
              "payload": audioBuffer
            }
          }
          console.log("Output len", JSON.stringify(json_query).length)
          ws.send(JSON.stringify(json_query))
          break;
        case "stop":
          console.log("stopped")
          break;
      }
    } catch (error) {
      console.log(error)
    }
  });
});
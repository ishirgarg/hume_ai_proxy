import express from "express";
import http from "http";
import {WebSocketServer} from "ws";

const app = express();
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
app.post("/twiml", (req, res) => {
  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Start>
        <Stream url="wss://${req.headers.host}/"/>
      </Start>
      <Say>Hi this is AI customer care services speaking. How can I help you?</Say>
      <Pause length="120" />
    </Response>
  `);
});
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("LISTENING")
  //console.log(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY);
});
//set 5mins
server.setTimeout(300000);

//handling websocket
wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message: string) {
    try {
      const msg = JSON.parse(message);
      switch (msg.event) {
        case "connected":
          console.log("connected")
          break;
        case "start":
          console.log("started")
          break;
        case "media":
          console.log("media")
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
import express from "express";
import http from "http";
import { Hume, HumeClient } from "hume";
import wavefile from "wavefile";
import { WebSocketServer } from "ws";

import * as dotenv from "dotenv";
dotenv.config();

// create Hume socket
let socket: Hume.empathicVoice.chat.ChatSocket | null = null;
let client: HumeClient | null = null;

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

const PORT = 8000;
server.listen(PORT, async () => {
  console.log("LISTENING");
  await connect();
});
server.setTimeout(300000);

// handling websocket
wss.on("connection", (ws) => {
  ws.on("message", async (message: string) => {
    try {
      const msg = JSON.parse(message);
      console.log("MSG recv");
      switch (msg.event) {
        case "connected":
          console.log("connected");
          break;
        case "start":
          console.log("started");
          break;
        case "media":
          console.log("media");
          if (msg?.media?.payload != null) {
            // Create a WaveFile instance
            const wav = new wavefile.WaveFile();
    
            // Initialize the WaveFile with the audio buffer
            wav.fromScratch(1, 8000, "8m", Buffer.from(msg.media.payload, "base64"));
    
            // Convert from mu-law to PCM Linear 16
            wav.fromMuLaw();
    
            // Resample to 16000 Hz for Hume AI
            wav.toSampleRate(16000);
    
            const results = wav.toBuffer()
            const audioInput: Omit<Hume.empathicVoice.AudioInput, "type"> = {
              data: Buffer.from(results).toString('base64')
            };

            socket?.sendAudioInput(audioInput)

            // Get the PCM samples as Int16Array
            //const samples = wav.getSamples();
            
            // // Calculate the number of samples in a 100ms chunk
            // const samplesPerChunk = Math.floor(16000 * 0.1); // 16000 samples per second * 0.1 seconds
    
            // // Process and send audio in 100ms chunks
            // for (let i = 0; i < samples.length; i += samplesPerChunk) {
            //   const chunk = samples.slice(i, i + samplesPerChunk);
    
            //   // Convert chunk to little-endian buffer
            //   const littleEndianBuffer = Buffer.allocUnsafe(chunk.length * 2);
            //   for (let j = 0; j < chunk.length; j++) {
            //     littleEndianBuffer.writeInt16LE(chunk[j], j * 2);
            //   }
    
            //   // Encode the little-endian buffer to base64
            //   const base64Data = littleEndianBuffer.toString("base64");
    
            //   // Send the audio input to Hume AI
            //   const audioInput: Omit<Hume.empathicVoice.AudioInput, "type"> = {
            //     data: base64Data,
            //   };
    
            //   console.log("Sending OUTPUT", base64Data)
            //   console.log("Socket is valid", socket != null)
            //   socket?.sendAudioInput(audioInput)
            // }
          }
          break;
        case "stop":
          console.log("stopped");
          break;
      }
      } catch (error) {
        console.error("Error processing audio for Hume AI:", error);
        if (error instanceof Error) {
          console.error(error.stack);
        }
      }
  });
});

async function connect(): Promise<void> {
  if (!client) {
    client = new HumeClient({
      apiKey: process.env.VITE_HUME_API_KEY || '',
      secretKey: process.env.VITE_HUME_SECRET_KEY || '',
    });
  }

  socket = await client.empathicVoice.chat.connect({
    configId: process.env.VITE_HUME_CONFIG_ID || '',
  });

  socket.on('open', handleWebSocketOpenEvent);
  socket.on('message', handleWebSocketMessageEvent);
  socket.on('error', handleWebSocketErrorEvent);
  socket.on('close', handleWebSocketCloseEvent);
}

async function handleWebSocketOpenEvent(): Promise<void> {
  console.log('Hume socket connection opened');
}

function handleWebSocketErrorEvent(error: Error): void {
  console.log(error);
}

async function handleWebSocketCloseEvent(): Promise<void> {
  console.log('Hume socket connection closed');
}

async function handleWebSocketMessageEvent(
  message: Hume.empathicVoice.SubscribeEvent
): Promise<void> {

  // handle messages received through the WebSocket (messages are distinguished by their "type" field.)
  switch (message.type) {
    // save chat_group_id to resume chat if disconnected
    case 'chat_metadata':
      break;
    // append user and assistant messages to UI for chat visibility
    case 'user_message':
    case 'assistant_message':
      console.log("RECV MSG from HUME: ", message.message)
      break;

    // add received audio to the playback queue, and play next audio output
    case 'audio_output':
      // convert base64 encoded audio to a Blob
      console.log("RECV AUDIO OUTPUT from HUME")
      break;
    // stop audio playback, clear audio playback queue, and update audio playback state on interrupt
    case 'user_interruption':
      break;
  }
}


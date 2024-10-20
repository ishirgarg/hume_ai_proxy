import express from "express";
import http from "http";
import { Hume, HumeClient } from "hume";
import wavefile from "wavefile";
import { WebSocketServer } from "ws";

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

const PORT = process.env.PORT || 8000;
server.listen(PORT, async () => {
  console.log("LISTENING");
  await connect();
});
server.setTimeout(300000);

async function connect(): Promise<void> {
  if (!client) {
    client = new HumeClient({
      apiKey: process.env.VITE_HUME_API_KEY || '',
    });
  }

  socket = await client.empathicVoice.chat.connect({
    configId: process.env.VITE_HUME_CONFIG_ID || '',
  });
}

// handling websocket
wss.on("connection", (ws) => {
  ws.on("message", async (message: string) => {
    try {
      const msg = JSON.parse(message);
      switch (msg.event) {
        case "connected":
          console.log("connected");
          break;
        case "start":
          console.log("started");
          break;
        case "media":
          console.log("media");
          break;
        case "stop":
          console.log("stopped");
          break;
      }

      // Decode the Base64 payload from Twilio
      const audioBuffer = Buffer.from(msg.media.payload, "base64");

      // Create a WaveFile instance
      const wav = new wavefile.WaveFile();

      // Initialize the WaveFile with the audio buffer
      wav.fromScratch(1, 8000, "8m", audioBuffer);

      // Convert from mu-law to PCM Linear 16
      wav.fromMuLaw();

      // Resample to 16000 Hz for Hume AI
      wav.toSampleRate(16000);

      // Get the PCM samples as Int16Array
      const samples = wav.getSamples();

      // Calculate the number of samples in a 100ms chunk
      const samplesPerChunk = Math.floor(16000 * 0.1); // 16000 samples per second * 0.1 seconds

      // Process and send audio in 100ms chunks
      for (let i = 0; i < samples.length; i += samplesPerChunk) {
        const chunk = samples.slice(i, i + samplesPerChunk);

        // Convert chunk to little-endian buffer
        const littleEndianBuffer = Buffer.allocUnsafe(chunk.length * 2);
        for (let j = 0; j < chunk.length; j++) {
          littleEndianBuffer.writeInt16LE(chunk[j], j * 2);
        }

        // Encode the little-endian buffer to base64
        const base64Data = littleEndianBuffer.toString("base64");

        // Send the audio input to Hume AI
        const audioInput: Omit<Hume.empathicVoice.AudioInput, "type"> = {
          data: base64Data,
        };

        socket?.sendAudioInput(audioInput);
      }
    } catch (error) {
      console.error("Error processing audio for Hume AI:", error);
      if (error instanceof Error) {
        console.error(error.stack);
      }
    }
  });
});

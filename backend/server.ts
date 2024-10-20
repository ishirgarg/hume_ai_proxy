// import {
//   Hume,
//   HumeClient,
//   convertBlobToBase64,
//   convertBase64ToBlob,
//   ensureSingleValidAudioTrack,
//   getAudioStream,
//   getBrowserSupportedMimeType,
//   MimeType,
// } from 'hume';


import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// import { WebSocketServer } from 'ws';
// import {
//   createServer
// } from 'https';
// import {
//   readFileSync
// } from "fs";

(async () => {
  /**
   * the Hume Client, includes methods for connecting to EVI and managing the Web Socket connection
   */
  // let client: HumeClient | null = null;

  /**
   * the WebSocket instance
   */
  // let socket: Hume.empathicVoice.chat.ChatSocket | null = null;

  /**
   * flag which denotes the intended state of the WebSocket
   */
  // let connected = false;
 
  /**
   * Socket to Twilio server
   */
  //let twilio_server;

  let twilio_socket: WebSocket | null = null;

  connect();

  /**
   * instantiates interface config and client, sets up Web Socket handlers, and establishes secure Web Socket connection
   */
  async function connect(): Promise<void> {
    // instantiate the HumeClient with credentials to make authenticated requests
    // if (!client) {
    //   client = new HumeClient({
    //     apiKey: process.env.VITE_HUME_API_KEY || '',
    //     secretKey: process.env.VITE_HUME_SECRET_KEY || '',
    //   });
    // }

    // // instantiates WebSocket and establishes an authenticated connection
    // socket = await client.empathicVoice.chat.connect({
    //   configId: process.env.VITE_HUME_CONFIG_ID || '',
    //   resumedChatGroupId: chatGroupId,
    // });

    // socket.on('open', handleWebSocketOpenEvent);
    // socket.on('message', handleWebSocketMessageEvent);
    // socket.on('error', handleWebSocketErrorEvent);
    // socket.on('close', handleWebSocketCloseEvent);

    // twilio_server = createServer({
    //   cert: readFileSync("./cert.pem"),
    //   key: readFileSync("./key.pem")
    // })
    // twilio_socket = new WebSocketServer({
    //     server: twilio_server
    // });
    twilio_socket = new WebSocket('wss://hume-ai-proxy.onrender.com');
    twilio_socket.onopen = function(_) {
        console.log("Connection established!");
    };
    twilio_socket.onmessage = function(e) {
        console.log(e.data);
    };
    twilio_socket.onclose = function(e) {
        console.log(e.code);
        console.log(e.reason);
    };              
    twilio_socket.onerror = function(e) {
        console.log(e);
    };      
    
    //twilio_server.listen(8000);
  }

  /**
   * stops audio capture and playback, and closes the Web Socket connection
   */
  // function disconnect(): void {
  //   // stop audio playback
  //   stopAudio();

  //   // stop audio capture
  //   recorder?.stop();
  //   recorder = null;
  //   audioStream = null;

  //   // set connected state to false to prevent automatic reconnect
  //   connected = false;

  //   // IF resumeChats flag is false, reset chatGroupId so a new conversation is started when reconnecting
  //   if (!resumeChats) {
  //     chatGroupId = undefined;
  //   }

  //   // closed the Web Socket connection
  //   socket?.close();
  // }

  /**
   * captures and records audio stream, and sends audio stream through the socket
   *
   * API Reference:
   * - `audio_input`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#send.Audio%20Input.type
   */
  
  /**
   * play the audio within the playback queue, converting each Blob into playable HTMLAudioElements
   */
  // function playAudio(): void {
  //   // IF there is nothing in the audioQueue OR audio is currently playing then do nothing
  //   if (!audioQueue.length || isPlaying) return;

  //   // update isPlaying state
  //   isPlaying = true;

  //   // pull next audio output from the queue
  //   const audioBlob = audioQueue.shift();

  //   // IF audioBlob is unexpectedly undefined then do nothing
  //   if (!audioBlob) return;

  //   // converts Blob to AudioElement for playback
  //   const audioUrl = URL.createObjectURL(audioBlob);
  //   currentAudio = new Audio(audioUrl);

  //   // play audio
  //   currentAudio.play();

  //   // callback for when audio finishes playing
  //   currentAudio.onended = () => {
  //     // update isPlaying state
  //     isPlaying = false;

  //     // attempt to pull next audio output from queue
  //     if (audioQueue.length) playAudio();
  //   };
  // }

  /**
   * stops audio playback, clears audio playback queue, and updates audio playback state
   */
  // function stopAudio(): void {
  //   // stop the audio playback
  //   currentAudio?.pause();
  //   currentAudio = null;

  //   // update audio playback state
  //   isPlaying = false;

  //   // clear the audioQueue
  //   audioQueue.length = 0;
  // }

  /**
   * callback function to handle a WebSocket opened event
   */
  // async function handleWebSocketOpenEvent(): Promise<void> {
  //   /* place logic here which you would like invoked when the socket opens */
  //   console.log('Web socket connection opened');

  //   // ensures socket will reconnect if disconnected unintentionally
  //   connected = true;

  //   await captureAudio();
  // }

  /**
   * callback function to handle a WebSocket message event
   *
   * API Reference:
   * - `user_message`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.User%20Message.type
   * - `assistant_message`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Assistant%20Message.type
   * - `audio_output`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Audio%20Output.type
   * - `user_interruption`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.User%20Interruption.type
   */
  // async function handleWebSocketMessageEvent(
  //   message: Hume.empathicVoice.SubscribeEvent
  // ): Promise<void> {
  //   /* place logic here which you would like to invoke when receiving a message through the socket */

  //   // handle messages received through the WebSocket (messages are distinguished by their "type" field.)
  //   switch (message.type) {
  //     // save chat_group_id to resume chat if disconnected
  //     case 'chat_metadata':
  //       chatGroupId = message.chatGroupId;
  //       break;

  //     // append user and assistant messages to UI for chat visibility
  //     case 'user_message':
  //       break

  //     case 'assistant_message':
  //       break;

  //     // add received audio to the playback queue, and play next audio output
  //     case 'audio_output':
  //       // convert base64 encoded audio to a Blob
  //       const audioOutput = message.data;
  //       const blob = convertBase64ToBlob(audioOutput, mimeType);

  //       // add audio Blob to audioQueue
  //       audioQueue.push(blob);

  //       // play the next audio output
  //       if (audioQueue.length >= 1) playAudio();
  //       break;

  //     // stop audio playback, clear audio playback queue, and update audio playback state on interrupt
  //     case 'user_interruption':
  //       stopAudio();
  //       break;
  //   }
  // }

  /**
   * callback function to handle a WebSocket error event
   */
  // function handleWebSocketErrorEvent(error: Error): void {
  //   /* place logic here which you would like invoked when receiving an error through the socket */
  //   console.error(error);
  // }

  /**
   * callback function to handle a WebSocket closed event
   */
  // async function handleWebSocketCloseEvent(): Promise<void> {
  //   /* place logic here which you would like invoked when the socket closes */

  //   // reconnect to the socket if disconnect was unintentional
  //   if (connected) await connect();

  //   console.log('Web socket connection closed');
  // }
})();
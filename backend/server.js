"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var hume_1 = require("hume");
var ws_1 = require("ws");
var dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file
var https_1 = require("https");
var fs_1 = require("fs");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    // async function connect_twilio(): Promise<void> {
    // }
    /**
     * instantiates interface config and client, sets up Web Socket handlers, and establishes secure Web Socket connection
     */
    function connect() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // instantiate the HumeClient with credentials to make authenticated requests
                        if (!client) {
                            client = new hume_1.HumeClient({
                                apiKey: process.env.VITE_HUME_API_KEY || '',
                                secretKey: process.env.VITE_HUME_SECRET_KEY || '',
                            });
                        }
                        return [4 /*yield*/, client.empathicVoice.chat.connect({
                                configId: process.env.VITE_HUME_CONFIG_ID || '',
                                resumedChatGroupId: chatGroupId,
                            })];
                    case 1:
                        // instantiates WebSocket and establishes an authenticated connection
                        socket = _a.sent();
                        socket.on('open', handleWebSocketOpenEvent);
                        socket.on('message', handleWebSocketMessageEvent);
                        socket.on('error', handleWebSocketErrorEvent);
                        socket.on('close', handleWebSocketCloseEvent);
                        // update ui state
                        toggleBtnStates();
                        twilio_server = (0, https_1.createServer)({
                            cert: (0, fs_1.readFileSync)("./cert.pem"),
                            key: (0, fs_1.readFileSync)("./key.pem")
                        });
                        twilio_socket = new ws_1.default.Server({
                            server: twilio_server
                        });
                        alert("Made server");
                        twilio_socket.on('connection', function (ws) {
                            alert('Twilio socket connection established.');
                            ws.on('message', function (data) {
                                console.log('Streaming audio data:', data);
                                // Process the incoming audio data here
                                alert("Received data");
                            });
                            ws.on('close', function () {
                                console.log('WebSocket connection closed.');
                            });
                        });
                        twilio_server.listen(8000);
                        return [2 /*return*/];
                }
            });
        });
    }
    /**
     * stops audio capture and playback, and closes the Web Socket connection
     */
    function disconnect() {
        // update ui state
        toggleBtnStates();
        // stop audio playback
        stopAudio();
        // stop audio capture
        recorder === null || recorder === void 0 ? void 0 : recorder.stop();
        recorder = null;
        audioStream = null;
        // set connected state to false to prevent automatic reconnect
        connected = false;
        // IF resumeChats flag is false, reset chatGroupId so a new conversation is started when reconnecting
        if (!resumeChats) {
            chatGroupId = undefined;
        }
        // closed the Web Socket connection
        socket === null || socket === void 0 ? void 0 : socket.close();
    }
    /**
     * captures and records audio stream, and sends audio stream through the socket
     *
     * API Reference:
     * - `audio_input`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#send.Audio%20Input.type
     */
    function captureAudio() {
        return __awaiter(this, void 0, void 0, function () {
            var timeSlice;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, hume_1.getAudioStream)()];
                    case 1:
                        audioStream = _a.sent();
                        // ensure there is only one audio track in the stream
                        (0, hume_1.ensureSingleValidAudioTrack)(audioStream);
                        // instantiate the media recorder
                        recorder = new MediaRecorder(audioStream, { mimeType: mimeType });
                        // callback for when recorded chunk is available to be processed
                        recorder.ondataavailable = function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var encodedAudioData, audioInput;
                            var data = _b.data;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        // IF size of data is smaller than 1 byte then do nothing
                                        if (data.size < 1)
                                            return [2 /*return*/];
                                        return [4 /*yield*/, (0, hume_1.convertBlobToBase64)(data)];
                                    case 1:
                                        encodedAudioData = _c.sent();
                                        audioInput = {
                                            data: encodedAudioData,
                                        };
                                        // send audio_input message
                                        socket === null || socket === void 0 ? void 0 : socket.sendAudioInput(audioInput);
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        timeSlice = 100;
                        recorder.start(timeSlice);
                        return [2 /*return*/];
                }
            });
        });
    }
    /**
     * play the audio within the playback queue, converting each Blob into playable HTMLAudioElements
     */
    function playAudio() {
        // IF there is nothing in the audioQueue OR audio is currently playing then do nothing
        if (!audioQueue.length || isPlaying)
            return;
        // update isPlaying state
        isPlaying = true;
        // pull next audio output from the queue
        var audioBlob = audioQueue.shift();
        // IF audioBlob is unexpectedly undefined then do nothing
        if (!audioBlob)
            return;
        // converts Blob to AudioElement for playback
        var audioUrl = URL.createObjectURL(audioBlob);
        currentAudio = new Audio(audioUrl);
        // play audio
        currentAudio.play();
        // callback for when audio finishes playing
        currentAudio.onended = function () {
            // update isPlaying state
            isPlaying = false;
            // attempt to pull next audio output from queue
            if (audioQueue.length)
                playAudio();
        };
    }
    /**
     * stops audio playback, clears audio playback queue, and updates audio playback state
     */
    function stopAudio() {
        // stop the audio playback
        currentAudio === null || currentAudio === void 0 ? void 0 : currentAudio.pause();
        currentAudio = null;
        // update audio playback state
        isPlaying = false;
        // clear the audioQueue
        audioQueue.length = 0;
    }
    /**
     * callback function to handle a WebSocket opened event
     */
    function handleWebSocketOpenEvent() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        /* place logic here which you would like invoked when the socket opens */
                        console.log('Web socket connection opened');
                        // ensures socket will reconnect if disconnected unintentionally
                        connected = true;
                        return [4 /*yield*/, captureAudio()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /**
     * callback function to handle a WebSocket message event
     *
     * API Reference:
     * - `user_message`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.User%20Message.type
     * - `assistant_message`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Assistant%20Message.type
     * - `audio_output`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.Audio%20Output.type
     * - `user_interruption`: https://dev.hume.ai/reference/empathic-voice-interface-evi/chat/chat#receive.User%20Interruption.type
     */
    function handleWebSocketMessageEvent(message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, role, content, topThreeEmotions, audioOutput, blob;
            return __generator(this, function (_b) {
                /* place logic here which you would like to invoke when receiving a message through the socket */
                // handle messages received through the WebSocket (messages are distinguished by their "type" field.)
                switch (message.type) {
                    // save chat_group_id to resume chat if disconnected
                    case 'chat_metadata':
                        chatGroupId = message.chatGroupId;
                        break;
                    // append user and assistant messages to UI for chat visibility
                    case 'user_message':
                    case 'assistant_message':
                        _a = message.message, role = _a.role, content = _a.content;
                        topThreeEmotions = extractTopThreeEmotions(message);
                        appendMessage(role, content !== null && content !== void 0 ? content : '', topThreeEmotions);
                        break;
                    // add received audio to the playback queue, and play next audio output
                    case 'audio_output':
                        audioOutput = message.data;
                        blob = (0, hume_1.convertBase64ToBlob)(audioOutput, mimeType);
                        // add audio Blob to audioQueue
                        audioQueue.push(blob);
                        // play the next audio output
                        if (audioQueue.length >= 1)
                            playAudio();
                        break;
                    // stop audio playback, clear audio playback queue, and update audio playback state on interrupt
                    case 'user_interruption':
                        stopAudio();
                        break;
                }
                return [2 /*return*/];
            });
        });
    }
    /**
     * callback function to handle a WebSocket error event
     */
    function handleWebSocketErrorEvent(error) {
        /* place logic here which you would like invoked when receiving an error through the socket */
        console.error(error);
    }
    /**
     * callback function to handle a WebSocket closed event
     */
    function handleWebSocketCloseEvent() {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!connected) return [3 /*break*/, 2];
                        return [4 /*yield*/, connect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        console.log('Web socket connection closed');
                        return [2 /*return*/];
                }
            });
        });
    }
    /**
     * adds message to Chat in the webpage's UI
     *
     * @param role the speaker associated with the audio transcription
     * @param content transcript of the audio
     * @param topThreeEmotions the top three emotion prediction scores for the message
     */
    function appendMessage(role, content, topThreeEmotions) {
        // generate chat card component with message content and emotion scores
        var chatCard = new ChatCard({
            role: role,
            timestamp: new Date().toLocaleTimeString(),
            content: content,
            scores: topThreeEmotions,
        });
        // append chat card to the UI
        chat === null || chat === void 0 ? void 0 : chat.appendChild(chatCard.render());
        // scroll to the bottom to view most recently added message
        if (chat)
            chat.scrollTop = chat.scrollHeight;
    }
    /**
     * toggles `start` and `stop` buttons' disabled states
     */
    function toggleBtnStates() {
        if (startBtn)
            startBtn.disabled = !startBtn.disabled;
        if (stopBtn)
            stopBtn.disabled = !stopBtn.disabled;
    }
    /**
     * takes a received `user_message` or `assistant_message` and extracts the top 3 emotions from the
     * predicted expression measurement scores.
     */
    function extractTopThreeEmotions(message) {
        var _a;
        // extract emotion scores from the message
        var scores = (_a = message.models.prosody) === null || _a === void 0 ? void 0 : _a.scores;
        // convert the emotions object into an array of key-value pairs
        var scoresArray = Object.entries(scores || {});
        // sort the array by the values in descending order
        scoresArray.sort(function (a, b) { return b[1] - a[1]; });
        // extract the top three emotions and convert them back to an object
        var topThreeEmotions = scoresArray.slice(0, 3).map(function (_a) {
            var emotion = _a[0], score = _a[1];
            return ({
                emotion: emotion,
                score: (Math.round(Number(score) * 100) / 100).toFixed(2),
            });
        });
        return topThreeEmotions;
    }
    var startBtn, stopBtn, chat, client, socket, connected, recorder, audioStream, currentAudio, isPlaying, resumeChats, chatGroupId, audioQueue, twilio_server, twilio_socket, mimeType;
    return __generator(this, function (_a) {
        startBtn = document.querySelector('button#start-btn');
        stopBtn = document.querySelector('button#stop-btn');
        chat = document.querySelector('div#chat');
        startBtn === null || startBtn === void 0 ? void 0 : startBtn.addEventListener('click', connect);
        stopBtn === null || stopBtn === void 0 ? void 0 : stopBtn.addEventListener('click', disconnect);
        client = null;
        socket = null;
        connected = false;
        recorder = null;
        audioStream = null;
        currentAudio = null;
        isPlaying = false;
        resumeChats = true;
        audioQueue = [];
        twilio_socket = null;
        mimeType = (function () {
            var result = (0, hume_1.getBrowserSupportedMimeType)();
            return result.success ? result.mimeType : hume_1.MimeType.WEBM;
        })();
        return [2 /*return*/];
    });
}); })();
var ChatCard = /** @class */ (function () {
    function ChatCard(message) {
        this.message = message;
    }
    ChatCard.prototype.createScoreItem = function (score) {
        var scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = "".concat(score.emotion, ": <strong>").concat(score.score, "</strong>");
        return scoreItem;
    };
    ChatCard.prototype.render = function () {
        var _this = this;
        var card = document.createElement('div');
        card.className = "chat-card ".concat(this.message.role);
        var role = document.createElement('div');
        role.className = 'role';
        role.textContent =
            this.message.role.charAt(0).toUpperCase() + this.message.role.slice(1);
        var timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.innerHTML = "<strong>".concat(this.message.timestamp, "</strong>");
        var content = document.createElement('div');
        content.className = 'content';
        content.textContent = this.message.content;
        var scores = document.createElement('div');
        scores.className = 'scores';
        this.message.scores.forEach(function (score) {
            scores.appendChild(_this.createScoreItem(score));
        });
        card.appendChild(role);
        card.appendChild(timestamp);
        card.appendChild(content);
        card.appendChild(scores);
        return card;
    };
    return ChatCard;
}());

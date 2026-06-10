const toggleBtn = document.getElementById("toggle");
const gainSlider = document.getElementById("gain");
const gainValue = document.getElementById("gain-value");
const status = document.getElementById("status");

let audioCtx = null;
let gainNode = null;
let stream = null;
let sourceNode = null;
let destNode = null;
let audioEl = null;

gainSlider.addEventListener("input", () => {
  const val = parseFloat(gainSlider.value);
  gainValue.textContent = val.toFixed(1) + "x";
  if (gainNode) {
    gainNode.gain.value = val;
  }
});

toggleBtn.addEventListener("click", async () => {
  if (audioCtx) {
    stop();
    return;
  }
  await start();
});

async function start() {
  try {
    status.textContent = "Requesting microphone...";

    // First, establish a media playback audio session BEFORE opening the mic.
    // This primes iOS to use the media route (speaker/Bluetooth) instead of
    // the voice call route (earpiece) that getUserMedia forces.
    audioCtx = new AudioContext({ latencyHint: "interactive" });

    // Play a short silent buffer to establish the media audio session
    const silentBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate);
    const silentSource = audioCtx.createBufferSource();
    silentSource.buffer = silentBuffer;
    silentSource.connect(audioCtx.destination);
    silentSource.start();

    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    // Now request mic — the audio session is already in media mode
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    sourceNode = audioCtx.createMediaStreamSource(stream);
    gainNode = audioCtx.createGain();
    gainNode.gain.value = parseFloat(gainSlider.value);

    // Route through a MediaStream destination and play via <audio> element
    // so the OS treats this as media playback and routes to Bluetooth
    destNode = audioCtx.createMediaStreamDestination();
    sourceNode.connect(gainNode);
    gainNode.connect(destNode);

    // Also connect to audioCtx.destination as a fallback
    gainNode.connect(audioCtx.destination);

    // Play through an <audio> element in the DOM for OS media routing
    audioEl = document.createElement("audio");
    audioEl.setAttribute("playsinline", "");
    audioEl.srcObject = destNode.stream;
    document.body.appendChild(audioEl);
    await audioEl.play();

    toggleBtn.textContent = "Stop";
    toggleBtn.classList.add("active");
    status.textContent = "Live — routing mic to speaker";
  } catch (err) {
    status.textContent = "Error: " + err.message;
    stop();
  }
}

function stop() {
  if (audioEl) {
    audioEl.pause();
    audioEl.srcObject = null;
    audioEl.remove();
    audioEl = null;
  }
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
  if (destNode) {
    destNode = null;
  }
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }

  toggleBtn.textContent = "Start";
  toggleBtn.classList.remove("active");
  status.textContent = "Stopped";
}

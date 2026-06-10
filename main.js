const toggleBtn = document.getElementById("toggle");
const gainSlider = document.getElementById("gain");
const gainValue = document.getElementById("gain-value");
const status = document.getElementById("status");

let audioCtx = null;
let gainNode = null;
let stream = null;
let sourceNode = null;

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

    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        latencyHint: "interactive",
      },
    });

    audioCtx = new AudioContext({ latencyHint: "interactive" });

    // Resume context (required on mobile after user gesture)
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    sourceNode = audioCtx.createMediaStreamSource(stream);
    gainNode = audioCtx.createGain();
    gainNode.gain.value = parseFloat(gainSlider.value);

    sourceNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    toggleBtn.textContent = "Stop";
    toggleBtn.classList.add("active");
    status.textContent = "Live — routing mic to speaker";
  } catch (err) {
    status.textContent = "Error: " + err.message;
    stop();
  }
}

function stop() {
  if (sourceNode) {
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
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

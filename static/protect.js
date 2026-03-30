let recognition = null;
let mediaRecorder = null;
let audioChunks = [];
let timer = null;
let seconds = 0;
let protectionActive = false;

// 🟢 FIX: Define Global Location Variables
let currentLat = "0.0000";
let currentLng = "0.0000";

// DOM Elements
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const status = document.getElementById("status");
const micStatus = document.getElementById("micStatus");
const chatBox = document.getElementById("chatBox");
const banner = document.getElementById("activeBanner");
const thinking = document.getElementById("thinking");
const progressFill = document.getElementById("progressFill");
const stealthOverlay = document.getElementById("stealthOverlay");
const geoStatus = document.getElementById("geoStatus");

// ---------- UTILS ----------
function addChat(sender, text) {
  const div = document.createElement("div");
  div.className = sender;
  // If AI, add a warning icon
  const prefix = sender === "ai" ? "🛡️ <b>LEGAL ALERT:</b><br>" : "";
  div.innerHTML = prefix + text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function toggleStealth() {
    if (stealthOverlay.style.display === "block") {
        stealthOverlay.style.display = "none";
    } else {
        stealthOverlay.style.display = "block";
    }
}

// ---------- SOS FUNCTION (Triggered by GPS) ----------
function triggerAutoSOS() {
    // 🟢 FIX: Use Global Variables
    const lat = currentLat;
    const lng = currentLng;

    addChat("system-msg", "📡 Sending Emergency SMS via Server...");

    fetch('/api/send-sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: lat, lng: lng })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            addChat("system-msg", "✅ SOS SMS Sent Successfully!");
        } else {
            addChat("system-msg", "❌ SMS Failed: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        addChat("system-msg", "❌ Network Error sending SMS");
    });
}

// ---------- GEOLOCATION (FIXED LOGIC) ----------
function captureLocation() {
    // Visual feedback
    addChat("system-msg", "🛰️ Acquiring precise GPS location...");

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // 1. Update Global Variables
                currentLat = position.coords.latitude.toFixed(5);
                currentLng = position.coords.longitude.toFixed(5);
                const accuracy = position.coords.accuracy;

                // 2. Update UI
                geoStatus.innerText = `📍 ${currentLat}, ${currentLng} (±${accuracy}m)`;
                geoStatus.style.color = "#00ff00"; 
                addChat("system-msg", `✅ Location Locked: ${currentLat}, ${currentLng}`);

                // 3. 🔥 CRITICAL FIX: Trigger SMS ONLY NOW (After location is found)
                triggerAutoSOS(); 
            }, 
            (error) => {
                console.warn("GPS Error:", error);
                geoStatus.innerText = "📍 Location Failed";
                addChat("system-msg", "⚠️ GPS Failed. Sending SMS with default location.");
                
                // Send SMS anyway (Emergency fallback)
                triggerAutoSOS();
            },
            {
                enableHighAccuracy: true, // Force best GPS
                timeout: 10000,           // Wait 10 seconds max
                maximumAge: 0
            }
        );
    } else {
        addChat("system-msg", "❌ Geolocation not supported");
        // Send SMS anyway
        triggerAutoSOS();
    }
}

// ---------- RECORDING (EVIDENCE) ----------
async function startAudioRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            // Create Blob and Trigger Download
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = `LexGuard_Evidence_${new Date().toISOString()}.wav`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            audioChunks = []; // Clear buffer
        };
    } catch (err) {
        console.error("Mic Access Denied:", err);
        alert("Microphone access is required for evidence recording.");
    }
}

// ---------- MAIN PROTECTION LOGIC ----------
function startProtection() {
  if (protectionActive) return;

  protectionActive = true;
  banner.style.display = "block";
  micStatus.innerText = "🎤 Mic: LIVE";
  micStatus.classList.add("mic-active");
  status.innerText = "System Armed & Recording";
  startBtn.disabled = true;
  stopBtn.disabled = false;
  
  // Start Audio
  startAudioRecording();
  
  // Start GPS (Which will then trigger SOS)
  captureLocation(); 
  
  // 🟢 NOTE: triggerAutoSOS() is removed from here because captureLocation() calls it now.

  // Timer
  seconds = 0;
  timer = setInterval(() => {
    seconds++;
    const percent = (seconds / 600) * 100;
    progressFill.style.width = percent + "%";
    if (seconds >= 600) stopProtection();
  }, 1000);
}

function stopProtection() {
  if (!protectionActive) return;

  protectionActive = false;
  banner.style.display = "none";
  micStatus.innerText = "🎤 Mic: Off";
  micStatus.classList.remove("mic-active");
  status.innerText = "Protection Ended. Saving Evidence...";
  startBtn.disabled = false;
  stopBtn.disabled = true;

  clearInterval(timer);
  progressFill.style.width = "0%";

  // Stop Recording (Triggers Download)
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
  }
}

// ---------- SPEECH RECOGNITION ----------
function initSpeech() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("Speech API not supported.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    if (!result.isFinal) return;

    const text = result[0].transcript.toLowerCase();

    // Voice Commands
    if (text.includes("protect me")) {
      startProtection();
      return;
    }
    if (text.includes("stop protection") || text.includes("end protection")) {
      stopProtection();
      return;
    }

    if (!protectionActive) return;

    addChat("talker", text);
    thinking.style.display = "block";

    // KEYWORD DETECTION LOGIC
    setTimeout(() => {
      thinking.style.display = "none";
      
      // Keywords
      if (text.includes("search") || text.includes("trunk") || text.includes("bag")) {
        addChat("ai", "<b>SEARCH & SEIZURE:</b><br>Police need a warrant or 'probable cause' to search your car.");
      }
      else if (text.includes("arrest") || text.includes("station")) {
        addChat("ai", "<b>ARREST RIGHTS:</b><br>Ask: 'Am I under arrest?' If yes, you have the right to remain silent.");
      }
      else if (text.includes("sign") || text.includes("paper")) {
        addChat("ai", "<b>DO NOT SIGN:</b><br>You are not legally required to sign any statement without a lawyer.");
      }
      else if (text.includes("phone") || text.includes("unlock")) {
        addChat("ai", "<b>DIGITAL PRIVACY:</b><br>You are NOT required to unlock your phone biometric/password for police.");
      }
    }, 500);
  };

  recognition.onend = () => {
      // Auto-restart
      setTimeout(() => {
          if (recognition) recognition.start();
      }, 500);
  };

  recognition.start();
}

// Event Listeners
startBtn.onclick = startProtection;
stopBtn.onclick = stopProtection;

// Init
initSpeech();
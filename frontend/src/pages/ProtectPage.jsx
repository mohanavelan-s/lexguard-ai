import { useEffect, useRef, useState } from "react";

import SectionHero from "../components/SectionHero";
import { apiRequest } from "../lib/api";

function getAlertCopy(text) {
  if (text.includes("search") || text.includes("trunk") || text.includes("bag")) {
    return "Search and seizure: police typically need a warrant or clear probable cause to search your vehicle.";
  }
  if (text.includes("arrest") || text.includes("station")) {
    return "Arrest rights: ask if you are under arrest, remain calm, and request access to a lawyer.";
  }
  if (text.includes("sign") || text.includes("paper")) {
    return "Document warning: avoid signing statements or confessions without legal advice.";
  }
  if (text.includes("phone") || text.includes("unlock")) {
    return "Digital privacy: you may contest compelled access to your phone, especially without proper legal authority.";
  }

  return "";
}

export default function ProtectPage() {
  const [active, setActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [status, setStatus] = useState("Protection is on standby.");
  const [geoStatus, setGeoStatus] = useState("Location not captured yet.");
  const [feed, setFeed] = useState([
    {
      id: "boot",
      speaker: "system",
      text: "Enable voice commands or arm protection manually to start recording, location capture, and SOS support."
    }
  ]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [evidenceFilename, setEvidenceFilename] = useState("");
  const [error, setError] = useState("");
  const [sosMessage, setSosMessage] = useState("");

  const activeRef = useRef(false);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const voiceEnabledRef = useRef(false);
  const coordsRef = useRef({ lat: "0", lng: "0" });

  const appendFeed = (speaker, text) => {
    setFeed((current) => [
      ...current.slice(-11),
      { id: `${speaker}-${Date.now()}-${Math.random()}`, speaker, text }
    ]);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const releaseMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const uploadEvidence = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, `lexguard-evidence-${Date.now()}.webm`);
    const payload = await apiRequest("/save-audio", {
      method: "POST",
      body: formData
    });
    setEvidenceFilename(payload.filename || "");
    appendFeed("system", `Evidence saved as ${payload.filename || "audio clip"}.`);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data?.size) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];
        releaseMic();
        if (!blob.size) {
          return;
        }
        try {
          await uploadEvidence(blob);
        } catch (requestError) {
          setError(requestError.message);
          appendFeed("system", "Evidence upload failed.");
        }
      };
      recorder.start();
      appendFeed("system", "Microphone recording started.");
    } catch (requestError) {
      setError("Microphone access is required to record evidence.");
      appendFeed("system", "Microphone permission was denied.");
    }
  };

  const sendSos = async (lat, lng) => {
    setSosMessage("Sending emergency SMS...");
    appendFeed("system", `Sending SOS using coordinates ${lat}, ${lng}.`);

    try {
      const payload = await apiRequest("/api/send-sos", {
        method: "POST",
        body: { lat, lng }
      });
      if (payload.status === "success") {
        setSosMessage("Emergency SMS sent.");
        appendFeed("system", "Emergency SMS sent successfully.");
      } else {
        setSosMessage(payload.message || "SOS send failed.");
        appendFeed("system", payload.message || "SOS send failed.");
      }
    } catch (requestError) {
      setError(requestError.message);
      setSosMessage(`SOS failed: ${requestError.message}`);
      appendFeed("system", `SOS failed: ${requestError.message}`);
    }
  };

  const captureLocation = (shouldSendSos = false) => {
    appendFeed("system", "Capturing GPS location...");

    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported in this browser.");
      if (shouldSendSos) {
        sendSos(coordsRef.current.lat, coordsRef.current.lng);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        coordsRef.current = { lat, lng };
        setGeoStatus(`${lat}, ${lng} (+/- ${Math.round(position.coords.accuracy)}m)`);
        appendFeed("system", `Location locked at ${lat}, ${lng}.`);
        if (shouldSendSos) {
          sendSos(lat, lng);
        }
      },
      () => {
        setGeoStatus("Location capture failed. Using fallback coordinates.");
        appendFeed("system", "Location capture failed.");
        if (shouldSendSos) {
          sendSos(coordsRef.current.lat, coordsRef.current.lng);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopProtection = () => {
    if (!activeRef.current) {
      return;
    }

    activeRef.current = false;
    setActive(false);
    setStatus("Protection stopped. Finalizing evidence upload.");
    appendFeed("system", "Protection stopped.");
    stopTimer();

    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    } else {
      releaseMic();
    }
  };

  const startProtection = async () => {
    if (activeRef.current) {
      return;
    }

    activeRef.current = true;
    setActive(true);
    setStatus("Protection armed. Recording and emergency systems are active.");
    setTimerSeconds(0);
    setError("");
    appendFeed("system", "Protection armed.");

    stopTimer();
    timerRef.current = setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

    await startRecording();
    captureLocation(true);
  };

  const toggleVoiceCommands = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results?.[event.results.length - 1]?.[0]?.transcript?.toLowerCase() || "";
        if (!transcript) {
          return;
        }

        appendFeed("user", transcript);

        if (transcript.includes("protect me")) {
          startProtection();
          return;
        }

        if (transcript.includes("stop protection") || transcript.includes("end protection")) {
          stopProtection();
          return;
        }

        if (activeRef.current) {
          const alertCopy = getAlertCopy(transcript);
          if (alertCopy) {
            appendFeed("ai", alertCopy);
          }
        }
      };

      recognition.onerror = () => {
        setError("Voice monitoring hit an error. You can still use the manual controls.");
      };

      recognition.onend = () => {
        if (voiceEnabledRef.current) {
          try {
            recognition.start();
          } catch (error) {
            setError("Voice monitoring paused. Click the button again if needed.");
          }
        }
      };

      recognitionRef.current = recognition;
    }

    if (voiceEnabledRef.current) {
      voiceEnabledRef.current = false;
      setVoiceEnabled(false);
      setStatus("Voice monitoring disabled.");
      recognitionRef.current.stop();
      return;
    }

    voiceEnabledRef.current = true;
    setVoiceEnabled(true);
    setStatus("Voice monitoring enabled. Say 'protect me' to arm.");
    setError("");

    try {
      recognitionRef.current.start();
    } catch (requestError) {
      voiceEnabledRef.current = false;
      setVoiceEnabled(false);
      setError("Voice monitoring could not start. Check microphone permissions and try again.");
    }
  };

  useEffect(() => {
    if (active && timerSeconds >= 600) {
      stopProtection();
    }
  }, [active, timerSeconds]);

  useEffect(() => {
    return () => {
      voiceEnabledRef.current = false;
      stopTimer();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      } else {
        releaseMic();
      }
    };
  }, []);

  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Protect mode"
        title="Keep emergency tools live from the new frontend."
        description="Voice triggers, evidence recording, geolocation, and SOS delivery now sit inside the React app while still using the Flask backend for upload and messaging."
        actions={
          <>
            <button className="primary-button" onClick={startProtection} type="button">
              Arm protection
            </button>
            <button className="danger-button" onClick={stopProtection} type="button">
              Stop protection
            </button>
          </>
        }
      />

      <section className="two-column-grid">
        <section className="section-card">
          <div className="section-heading">
            <h2>Control center</h2>
            <span className={`badge badge-${active ? "alert" : "neutral"}`}>{active ? "Armed" : "Standby"}</span>
          </div>

          <div className="stack-list">
            <div className="detail-block">
              <span className="detail-label">Status</span>
              <p>{status}</p>
            </div>
            <div className="detail-block">
              <span className="detail-label">GPS</span>
              <p>{geoStatus}</p>
            </div>
            <div className="detail-block">
              <span className="detail-label">SOS</span>
              <p>{sosMessage || "Not sent yet."}</p>
            </div>
            <div className="detail-block">
              <span className="detail-label">Evidence file</span>
              <p>{evidenceFilename || "No evidence uploaded yet."}</p>
            </div>
            <div className="detail-block">
              <span className="detail-label">Elapsed time</span>
              <p>{Math.floor(timerSeconds / 60)}m {timerSeconds % 60}s</p>
            </div>

            <div className="progress-track large">
              <div className="progress-fill alert" style={{ width: `${Math.min((timerSeconds / 600) * 100, 100)}%` }} />
            </div>

            <div className="button-row">
              <button className="secondary-button" onClick={toggleVoiceCommands} type="button">
                {voiceEnabled ? "Disable voice watch" : "Enable voice watch"}
              </button>
              <button className="ghost-button" onClick={() => captureLocation(false)} type="button">
                Refresh location
              </button>
              <button
                className="ghost-button"
                onClick={() => sendSos(coordsRef.current.lat, coordsRef.current.lng)}
                type="button"
              >
                Send SOS now
              </button>
            </div>

            <div className="status-banner status-info">
              Voice triggers supported: say <strong>protect me</strong> to arm, or <strong>stop protection</strong> to end the session.
            </div>
            {error ? <div className="status-banner status-error">{error}</div> : null}
          </div>
        </section>

        <section className="section-card">
          <div className="section-heading">
            <h2>Live transcript</h2>
            <span className="micro-note">Recent voice and system events stay visible here.</span>
          </div>

          <div className="transcript-feed">
            {feed.map((entry) => (
              <article className={`transcript-item transcript-${entry.speaker}`} key={entry.id}>
                <span className="detail-label">{entry.speaker}</span>
                <p>{entry.text}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, LocateFixed, Mic, Radio, ShieldAlert, Siren } from "lucide-react";

import { PageTransition } from "@/components/layout/PageTransition";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InputField } from "@/components/ui/InputField";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { activateProtectMode, sendSosSignal } from "@/lib/api";
import { useUiStore } from "@/store/ui-store";

function getAlertCopy(text) {
  if (text.includes("search") || text.includes("vehicle") || text.includes("bag")) {
    return "Ask for the legal basis of the search, keep your hands visible, and document officer names if possible.";
  }
  if (text.includes("arrest") || text.includes("station")) {
    return "Stay calm, ask whether you are under arrest, and request access to a lawyer as early as possible.";
  }
  if (text.includes("sign") || text.includes("statement")) {
    return "Avoid signing statements or waivers until you understand the consequences and can get legal advice.";
  }
  if (text.includes("phone") || text.includes("unlock")) {
    return "Clarify what is being requested and avoid volunteering consent beyond what you understand.";
  }

  return "Prioritize calm, preserve evidence, and document names, times, and instructions while you wait for support.";
}

function formatElapsed(seconds) {
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export default function ProtectWorkspacePage() {
  const pushToast = useUiStore((state) => state.pushToast);
  const [active, setActive] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [status, setStatus] = useState("Protection is on standby.");
  const [geoStatus, setGeoStatus] = useState("Location not captured yet.");
  const [feed, setFeed] = useState([
    {
      id: "boot",
      speaker: "system",
      text: "Enable voice watch or arm protection manually to start a live emergency session."
    }
  ]);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [error, setError] = useState("");
  const [sosMessage, setSosMessage] = useState("");
  const [keyword, setKeyword] = useState("Police asked to search my vehicle");
  const [quickGuidance, setQuickGuidance] = useState(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);

  const activeRef = useRef(false);
  const recognitionRef = useRef(null);
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

  const sendSos = async (lat, lng) => {
    setSosMessage("Sending emergency SMS...");
    appendFeed("system", `Sending SOS with coordinates ${lat}, ${lng}.`);

    try {
      const payload = await sendSosSignal({ lat, lng });
      if (payload.status === "success") {
        setSosMessage("Emergency SMS sent.");
        appendFeed("system", "Emergency SMS sent successfully.");
        pushToast({
          title: "SOS sent",
          description: "Emergency coordinates were pushed through the backend.",
          tone: "success"
        });
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
    setStatus("Protection stopped.");
    appendFeed("system", "Protection stopped.");
    stopTimer();
  };

  const startProtection = async () => {
    if (activeRef.current) {
      return;
    }

    activeRef.current = true;
    setActive(true);
    setStatus("Protection armed. Emergency controls are active.");
    setTimerSeconds(0);
    setError("");
    appendFeed("system", "Protection armed.");

    stopTimer();
    timerRef.current = setInterval(() => {
      setTimerSeconds((current) => current + 1);
    }, 1000);

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

        appendFeed("ai", getAlertCopy(transcript));
      };

      recognition.onerror = () => {
        setError("Voice monitoring hit an error. You can still use the manual controls.");
      };

      recognition.onend = () => {
        if (voiceEnabledRef.current) {
          try {
            recognition.start();
          } catch (requestError) {
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

  const handleQuickGuidance = async () => {
    if (!keyword.trim() || guidanceLoading) {
      return;
    }

    setGuidanceLoading(true);
    try {
      const payload = await activateProtectMode(keyword.trim());
      setQuickGuidance(payload);
      appendFeed("ai", payload.action || payload.message || "Protect mode guidance received.");
      pushToast({
        title: "Quick guidance ready",
        description: "The emergency response card was refreshed.",
        tone: "success"
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setGuidanceLoading(false);
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
    };
  }, []);

  return (
    <PageTransition className="space-y-8">
      <SectionHeading
        actions={
          <div className="flex flex-wrap gap-3">
            <Button onClick={startProtection} type="button">
              Arm protection
            </Button>
            <Button onClick={stopProtection} type="button" variant="danger">
              Stop protection
            </Button>
          </div>
        }
        description="A premium emergency workspace for location capture, SOS messaging, voice watch, and quick-response legal guidance."
        eyebrow="Protect mode"
        title="Keep emergency tools one tap away"
      />

      <div className="grid gap-6 xl:grid-cols-[0.94fr,1.06fr]">
        <div className="space-y-6">
          <Card className="rounded-[32px]">
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Control center</p>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Emergency state</h3>
                </div>
                <Badge variant={active ? "danger" : "neutral"}>{active ? "Armed" : "Standby"}</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                  <p className="text-sm text-muted-foreground">Elapsed time</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-foreground">{formatElapsed(timerSeconds)}</p>
                </div>
                <div className="rounded-[28px] border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                  <p className="text-sm text-muted-foreground">Voice watch</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-foreground">{voiceEnabled ? "Live" : "Off"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-[28px] border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                  <LocateFixed className="mt-1 h-5 w-5 text-brand" />
                  <div>
                    <p className="font-medium text-foreground">GPS location</p>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">{geoStatus}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[28px] border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                  <Siren className="mt-1 h-5 w-5 text-brand" />
                  <div>
                    <p className="font-medium text-foreground">SOS delivery</p>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">{sosMessage || "Not sent yet."}</p>
                  </div>
                </div>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-foreground/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-warning via-danger to-danger"
                  style={{ width: `${Math.min((timerSeconds / 600) * 100, 100)}%` }}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={toggleVoiceCommands} type="button" variant="secondary">
                  <Mic className="h-4 w-4" />
                  {voiceEnabled ? "Disable voice watch" : "Enable voice watch"}
                </Button>
                <Button onClick={() => captureLocation(false)} type="button" variant="secondary">
                  <LocateFixed className="h-4 w-4" />
                  Refresh location
                </Button>
                <Button onClick={() => sendSos(coordsRef.current.lat, coordsRef.current.lng)} type="button" variant="outline">
                  <Siren className="h-4 w-4" />
                  Send SOS now
                </Button>
              </div>

              <div className="rounded-[28px] border border-warning/20 bg-warning/10 px-4 py-4 text-sm leading-7 text-warning-foreground">
                Voice commands supported: say <strong>protect me</strong> to arm, or <strong>stop protection</strong> to end the session.
              </div>

              {error ? <div className="rounded-3xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger-foreground">{error}</div> : null}
            </div>
          </Card>

          <Card className="rounded-[32px]">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Quick-response AI</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Get a fast protect briefing</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Scenario</label>
                <InputField onChange={(event) => setKeyword(event.target.value)} value={keyword} />
              </div>

              <div className="flex flex-wrap gap-2">
                {["Police search request", "Asked to sign a statement", "Phone unlock demand"].map((item) => (
                  <button
                    className="rounded-full border border-border/70 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-brand/30 hover:bg-brand/10 hover:text-foreground"
                    key={item}
                    onClick={() => setKeyword(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>

              <Button disabled={guidanceLoading} onClick={handleQuickGuidance} type="button">
                <Radio className="h-4 w-4" />
                {guidanceLoading ? "Preparing guidance..." : "Generate quick protect guidance"}
              </Button>

              <div className="rounded-[28px] border border-border/70 bg-white/70 p-4 dark:bg-white/[0.03]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Latest advisory</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {quickGuidance?.action || quickGuidance?.message || "Run a quick guidance request to populate this panel with backend-ready emergency advice."}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="rounded-[32px]">
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand/80">Live transcript</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">Recent emergency events</h3>
              </div>
              <Badge variant="neutral">{feed.length} events</Badge>
            </div>

            <div className="pretty-scrollbar max-h-[760px] space-y-3 overflow-y-auto pr-1">
              {feed.map((entry) => (
                <div
                  className={`rounded-[28px] border px-4 py-4 ${
                    entry.speaker === "system"
                      ? "border-brand/15 bg-brand/10"
                      : entry.speaker === "ai"
                        ? "border-success/15 bg-success/10"
                        : "border-border/70 bg-white/70 dark:bg-white/[0.03]"
                  }`}
                  key={entry.id}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{entry.speaker}</p>
                  <p className="mt-2 text-sm leading-7 text-foreground">{entry.text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[28px] border border-border/70 bg-white/70 p-5 dark:bg-white/[0.03]">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-1 h-5 w-5 text-brand" />
                <div>
                  <p className="font-medium text-foreground">Current status</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{status}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-danger/20 bg-danger/10 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 text-danger-foreground" />
                <div>
                  <p className="font-medium text-danger-foreground">Safety note</p>
                  <p className="mt-2 text-sm leading-7 text-danger-foreground/90">
                    LexGuard can support the flow, but emergencies still need direct help from local authorities, a trusted contact, or qualified legal counsel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}

"use client";

import { useEffect, useState } from "react";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
}

interface ShiftStatus {
  currentShiftId: string | null;
  clockedInAt: string | null;
}

type View = "list" | "confirm";

export default function ClockPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus | null>(null);
  const [view, setView] = useState<View>("list");
  const [actionLoading, setActionLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.staff ?? [];
        setStaff(list.sort((a: StaffMember, b: StaffMember) =>
          a.firstName.localeCompare(b.firstName)
        ));
        setLoading(false);
      });
  }, []);

  async function handleSelectStaff(member: StaffMember) {
    setSelected(member);
    setView("confirm");
    // Fetch their current clock status
    const res = await fetch(`/api/clock?staffId=${member.id}`);
    const data = await res.json();
    setShiftStatus({
      currentShiftId: data.currentShiftId,
      clockedInAt: data.clockedInAt,
    });
  }

  async function handleClock() {
    if (!selected || !shiftStatus || actionLoading) return;
    setActionLoading(true);
    const action = shiftStatus.currentShiftId ? "out" : "in";

    try {
      const res = await fetch("/api/clock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: selected.id, action }),
      });
      const data = await res.json();

      if (action === "in") {
        setResultMessage(`${selected.firstName} is clocked in!`);
      } else {
        setResultMessage(`${selected.firstName} clocked out. Total: ${data.duration}`);
      }

      setShowResult(true);

      // Return to list after 3 seconds
      setTimeout(() => {
        setShowResult(false);
        setSelected(null);
        setShiftStatus(null);
        setView("list");
        setResultMessage("");
      }, 3000);
    } catch {
      setResultMessage("Something went wrong. Please try again.");
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        setView("list");
        setSelected(null);
        setShiftStatus(null);
      }, 2500);
    } finally {
      setActionLoading(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  const isClockedIn = shiftStatus?.currentShiftId != null;

  // ── Result splash ──────────────────────────────────────────────────────────
  if (showResult) {
    return (
      <div style={{
        minHeight: "100vh",
        background: isClockedIn
          ? "linear-gradient(160deg, #0f2027, #1a3a2a)"
          : "linear-gradient(160deg, #1a1a2e, #0f0f1a)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        padding: 24,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>
          {resultMessage.includes("wrong") ? "⚠️" : "✓"}
        </div>
        <div style={{ fontSize: 24, color: "#fff", letterSpacing: -0.5 }}>
          {resultMessage}
        </div>
      </div>
    );
  }

  // ── Confirm screen ─────────────────────────────────────────────────────────
  if (view === "confirm" && selected) {
    return (
      <div style={{
        minHeight: "100vh",
        background: isClockedIn
          ? "linear-gradient(160deg, #0f2027, #1a3a2a)"
          : "linear-gradient(160deg, #0f0f1a, #1a1a2e)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        padding: 24,
        transition: "background 0.6s ease",
      }}>
        <div style={{ textAlign: "center", maxWidth: 320, width: "100%" }}>

          <div style={{
            fontSize: 11,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            marginBottom: 48,
          }}>
            Staff Portal
          </div>

          <div style={{ fontSize: 34, color: "#fff", fontWeight: 400, marginBottom: 8, letterSpacing: -0.5 }}>
            {selected.firstName} {selected.lastName}
          </div>

          {shiftStatus === null && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 56 }}>
              Checking status...
            </div>
          )}

          {shiftStatus !== null && isClockedIn && shiftStatus.clockedInAt && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 56, letterSpacing: 1 }}>
              Clocked in at {formatTime(shiftStatus.clockedInAt)}
            </div>
          )}

          {shiftStatus !== null && !isClockedIn && (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 56, letterSpacing: 1 }}>
              Not currently clocked in
            </div>
          )}

          {/* Big button */}
          <button
            onClick={handleClock}
            disabled={actionLoading || shiftStatus === null}
            style={{
              width: 190,
              height: 190,
              borderRadius: "50%",
              border: isClockedIn
                ? "2px solid rgba(100,220,140,0.4)"
                : "2px solid rgba(255,255,255,0.15)",
              background: isClockedIn
                ? "radial-gradient(circle, rgba(40,120,70,0.5), rgba(20,60,40,0.3))"
                : "radial-gradient(circle, rgba(60,60,100,0.4), rgba(20,20,50,0.2))",
              color: isClockedIn ? "#6ddc8a" : "rgba(255,255,255,0.8)",
              fontSize: 13,
              fontFamily: "'Georgia', serif",
              letterSpacing: 2,
              cursor: actionLoading || shiftStatus === null ? "not-allowed" : "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              margin: "0 auto",
              boxShadow: isClockedIn
                ? "0 0 60px rgba(100,220,140,0.15)"
                : "0 0 40px rgba(0,0,0,0.3)",
              opacity: actionLoading || shiftStatus === null ? 0.5 : 1,
              transition: "all 0.3s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: 34 }}>{isClockedIn ? "⏹" : "▶"}</span>
            <span style={{ textTransform: "uppercase" }}>
              {actionLoading ? "..." : isClockedIn ? "Clock Out" : "Clock In"}
            </span>
          </button>

          {/* Back link */}
          <button
            onClick={() => { setView("list"); setSelected(null); setShiftStatus(null); }}
            style={{
              marginTop: 40,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.25)",
              fontSize: 12,
              cursor: "pointer",
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "'Georgia', serif",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ── Staff list ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0f0f1a, #1a1a2e)",
      fontFamily: "'Georgia', serif",
      padding: "40px 20px",
    }}>
      <div style={{ maxWidth: 400, margin: "0 auto" }}>

        <div style={{
          fontSize: 11,
          letterSpacing: 4,
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 12,
        }}>
          Staff Portal
        </div>

        <div style={{
          fontSize: 22,
          color: "#fff",
          textAlign: "center",
          marginBottom: 36,
          fontWeight: 400,
        }}>
          Who are you?
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>
            LOADING...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {staff.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelectStaff(member)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  padding: "18px 24px",
                  color: "#fff",
                  fontSize: 17,
                  fontFamily: "'Georgia', serif",
                  textAlign: "left",
                  cursor: "pointer",
                  letterSpacing: -0.3,
                  transition: "background 0.15s ease, border-color 0.15s ease",
                  WebkitTapHighlightColor: "transparent",
                }}
                onTouchStart={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
                }}
                onTouchEnd={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                }}
              >
                {member.firstName} {member.lastName}
              </button>
            ))}
          </div>
        )}

        <LiveClock />
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      marginTop: 48,
      textAlign: "center",
      fontSize: 13,
      color: "rgba(255,255,255,0.15)",
      fontFamily: "monospace",
      letterSpacing: 2,
    }}>
      {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
    </div>
  );
}

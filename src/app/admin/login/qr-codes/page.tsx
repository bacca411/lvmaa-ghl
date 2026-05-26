"use client";

import { useState } from "react";

export default function ClockQRPage() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/clock` : "";
  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&margin=16&color=111111&bgcolor=ffffff`
    : "";

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
        }
      `}</style>

      {/* Screen header */}
      <div className="no-print" style={{
        padding: "24px 32px",
        borderBottom: "1px solid #eee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "sans-serif",
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#111" }}>
            Clock-In QR Code
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>
            Print this and put it somewhere staff can scan it.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="no-print"
          style={{
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "sans-serif",
          }}
        >
          🖨 Print
        </button>
      </div>

      {/* Printable card */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 48,
        minHeight: "calc(100vh - 90px)",
        background: "#f9fafb",
      }}>
        <div style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          fontFamily: "sans-serif",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          maxWidth: 360,
          width: "100%",
        }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#9ca3af",
          }}>
            Staff Clock-In
          </div>

          {qrSrc && (
            <img
              src={qrSrc}
              alt="Clock-in QR code"
              width={240}
              height={240}
              style={{ borderRadius: 8 }}
            />
          )}

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#111" }}>
              Scan to Clock In or Out
            </div>
            <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
            Use your phone&apos;s camera app
            </div>
          </div>

          <div className="no-print" style={{
            fontSize: 11,
            color: "#d1d5db",
            wordBreak: "break-all",
            textAlign: "center",
          }}>
            {url}
          </div>
        </div>
      </div>
    </>
  );
}

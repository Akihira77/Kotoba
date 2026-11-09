"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#faf6ee", color: "#2b2115" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <p style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "#b3402e", fontWeight: 700 }}>
            Kotoba
          </p>
          <h1 style={{ marginTop: 12, fontSize: 28 }}>Terjadi kesalahan tak terduga</h1>
          <p style={{ marginTop: 8, lineHeight: 1.7, color: "#6b5f52" }}>
            Data belajarmu tetap tersimpan di server lokal. Muat ulang halaman untuk mencoba lagi. Bila masalah
            berlanjut, periksa terminal server Kotoba.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, border: 0, borderRadius: 999, background: "#b3402e", color: "#fff", padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}

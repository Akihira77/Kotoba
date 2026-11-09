"use client";

import { useEffect } from "react";
import { Button, Card, LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Kotoba error:", error);
  }, [error]);

  return (
    <Card className="mx-auto mt-10 max-w-lg p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand dark:bg-brand/15">
        <Icon name="alert" size={24} />
      </div>
      <h1 className="text-xl font-bold">Terjadi kesalahan</h1>
      <p className="mt-2 text-sm text-muted">
        Halaman ini gagal dimuat. Coba muat ulang; progres belajarmu tetap tersimpan.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset}>Coba lagi</Button>
        <LinkButton href="/" variant="secondary">Ke dasbor</LinkButton>
      </div>
    </Card>
  );
}

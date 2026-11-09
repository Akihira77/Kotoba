import { LinkButton } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="font-jp text-6xl font-bold text-brand">迷子</p>
      <h1 className="mt-4 text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-sm text-muted">
        Sepertinya kamu tersesat. Tidak apa-apa — mari kembali ke jalur belajar.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <LinkButton href="/">Kembali ke dasbor</LinkButton>
        <LinkButton href="/practice" variant="secondary">Latihan cepat</LinkButton>
      </div>
      <p className="mt-8 inline-flex items-center gap-1.5 text-xs text-muted">
        <Icon name="torii" size={14} /> Kotoba · 言葉
      </p>
    </div>
  );
}

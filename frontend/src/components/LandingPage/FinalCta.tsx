import Link from "next/link";
import { Button } from "../ui/button";
export function FinalCTA() {
  return (
    <section className="py-8 relative overflow-hidden bg-background">
      {/* Özel Mesh Gradient Arka Plan */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-primary-foreground to-secondary"
          style={{
            maskImage: 'radial-gradient(ellipse at center, primary 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, primary-foreground 30%, transparent 80%)'
          }}
        />
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
          aria-hidden
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container text-center relative z-10">
        <h2 className="text-4xl font-bold mb-6  text-white">
          Hikayeni Paylaşmaya Hazır mısın?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
          Binlerce okuyucuyla buluşmak veya yeni hikayeler keşfetmek için şimdi katılın.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" variant="default" className="text-white hover:from-primary/90 hover:to-secondary/90">
            <Link href={'/auth/login'}>Ücretsiz Kaydol</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/20 hover:bg-primary-foreground/10">
          <Link href="/dashboard/books/new">Yaz</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
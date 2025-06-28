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
        <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-10 mix-blend-overlay" />
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
          <Link href={'/dashboard/stories/new'}>Yaz</Link> 
          </Button>
        </div>
      </div>
    </section>
  )
}
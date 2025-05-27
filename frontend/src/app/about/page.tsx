import { BookOpen, Users, Pen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Hakkımızda</h1>
        
        <div className="space-y-8">
          <div className="flex items-start gap-6">
            <div className="bg-primary/10 p-3 rounded-full mt-1">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">Biz Kimiz?</h2>
              <p className="text-muted-foreground">
                Folory, yazarlar ve okurlar için modern bir hikaye platformudur. 
                2025 yılında kurulan platformumuz, yaratıcılığı desteklemek ve 
                edebiyat severleri bir araya getirmek amacıyla yola çıktı.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="bg-primary/10 p-3 rounded-full mt-1">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">Vizyonumuz</h2>
              <p className="text-muted-foreground">
                Türkiye'nin en büyük dijital hikaye topluluğunu oluşturmayı 
                hedefliyoruz. Amacımız, yazarların eserlerini özgürce paylaşabileceği,
                okurların da kaliteli içeriklere kolayca ulaşabileceği bir platform sunmak.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="bg-primary/10 p-3 rounded-full mt-1">
              <Pen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-3">Özelliklerimiz</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Kolay hikaye yayınlama araçları</li>
                <li>Yazar-okur etkileşimini artıran sosyal özellikler</li>
                <li>Hikayeleri dışa aktarma imkanı (PDF/Word)</li>
                <li>Kişiselleştirilmiş okuma deneyimi</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link href="/contact">İletişime Geçin</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
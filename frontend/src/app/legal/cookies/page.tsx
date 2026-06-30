import { Button } from "@/components/ui/button"
import { Cookie, Shield, Settings } from "lucide-react"

export default function CookiesPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Çerez Politikası</h1>
        
        <div className="prose prose-sm text-muted-foreground">
          <div className="flex items-start gap-4 mb-8">
            <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold mb-3">Çerez Nedir?</h2>
              <p>
                Çerezler, web sitelerinin kullanıcı deneyimini iyileştirmek için 
                cihazınıza kaydedilen küçük metin dosyalarıdır. Fo-lory'de aşağıdaki 
                türde çerezler kullanılmaktadır:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Zorunlu Çerezler:</strong> Site fonksiyonelliği için gerekli</li>
                <li><strong>Performans Çerezleri:</strong> Kullanım analizleri için</li>
                <li><strong>Fonksiyonel Çerezler:</strong> Kişiselleştirme için</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-8">
            <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold mb-3">Çerez Yönetimi</h2>
              <p>
                Tarayıcınızın ayarlarından çerezleri kontrol edebilir veya silebilirsiniz. 
                Ancak bazı çerezleri devre dışı bırakmanın site fonksiyonelliğini 
                etkileyebileceğini unutmayın.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Settings className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold mb-3">Çerez Tercihleri</h2>
              <p>
                Siteyi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz. 
                Çerez ayarlarınızı aşağıdaki butondan özelleştirebilirsiniz.
              </p>
              <div className="mt-4">
                <Button variant="outline">Çerez Ayarlarını Yönet</Button>
              </div>
              <p className="mt-4">
                Son güncelleme tarihi: {new Date().toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
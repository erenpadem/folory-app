import { FileText, AlertTriangle, Check } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Kullanım Şartları</h1>
        
        <div className="prose prose-sm text-muted-foreground">
          <div className="flex items-start gap-4 mb-8">
            <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold mb-3">Genel Kurallar</h2>
              <p>
                Folory platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Platformu yasa dışı amaçlarla kullanamazsınız</li>
                <li>Telif hakkı ile korunan içerikleri izinsiz paylaşamazsınız</li>
                <li>Diğer kullanıcılara zarar verecek davranışlarda bulunamazsınız</li>
                <li>Spam veya reklam içerikli paylaşımlar yapamazsınız</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-8">
            <AlertTriangle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold mb-3">Sorumluluklar</h2>
              <p>
                Kullanıcılar olarak sizin sorumluluklarınız:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz</li>
                <li>Paylaştığınız içeriklerin yasalara uygunluğu sizin sorumluluğunuzdadır</li>
                <li>Platformun işleyişini aksatacak eylemlerden kaçınmalısınız</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold mb-3">Haklar ve İzinler</h2>
              <p>
                Folory olarak bizim haklarımız:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Şartlara uyulmadığı durumda hesapları askıya alma hakkı</li>
                <li>Platform kurallarını ihlal eden içerikleri kaldırma hakkı</li>
                <li>Gerektiğinde bu şartlarda değişiklik yapma hakkı</li>
              </ul>
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
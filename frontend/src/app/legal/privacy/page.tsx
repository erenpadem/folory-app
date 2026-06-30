import { Shield, Lock, Mail } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Gizlilik Politikası</h1>
        
        <div className="prose prose-sm text-muted-foreground">
          <div className="flex items-start gap-4 mb-8">
            <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold mb-3">Veri Toplama</h2>
              <p>
                Fo-lory olarak, kullanıcılarımızın gizliliğine önem veriyoruz. 
                Platformumuzda sadece hizmetlerimizi sunabilmek için gerekli olan 
                asgari düzeyde kişisel veri topluyoruz. Topladığımız veriler:
              </p>
              <ul className="list-disc pl-5 mt-2">
                <li>Hesap oluşturma sırasında ilettiğiniz temel bilgiler</li>
                <li>Platform kullanım alışkanlıklarınız (analiz amaçlı)</li>
                <li>İçerikleriniz ve etkileşimleriniz</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 mb-8">
            <Lock className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold mb-3">Veri Kullanımı</h2>
              <p>
                Toplanan veriler sadece aşağıdaki amaçlar için kullanılır:
              </p>
              <ul className="list-disc pl-5 mt-2">
                <li>Platform hizmetlerinin sağlanması</li>
                <li>Kullanıcı deneyiminin iyileştirilmesi</li>
                <li>Güvenlik önlemlerinin alınması</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold mb-3">İletişim</h2>
              <p>
                Gizlilik politikamızla ilgili her türlü soru ve öneriniz için 
                <Link href="/contact" className="text-primary hover:underline ml-1">
                  iletişim sayfamız
                </Link> 
                üzerinden bize ulaşabilirsiniz. Politika metnimizde yapılacak 
                değişiklikler bu sayfada duyurulacaktır.
              </p>
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
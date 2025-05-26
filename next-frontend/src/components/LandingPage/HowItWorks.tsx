import { Award, BookOpen, MessageSquare, UserPlus } from "lucide-react"

export function HowItWorks() {
    const steps = [
      {
        title: "Hesap Oluştur",
        description: "Ücretsiz hesabınızı oluşturun, yazar veya okuyucu olarak katılın.",
        icon: <UserPlus className="h-8 w-8" />
      },
      {
        title: "Keşfet veya Yayınla",
        description: "Hikayeler okuyun veya kendi hikayelerinizi yayınlayın.",
        icon: <BookOpen className="h-8 w-8" />
      },
      {
        title: "Etkileşime Geç",
        description: "Beğenin, yorum yapın, takip edin ve topluluğa katılın.",
        icon: <MessageSquare className="h-8 w-8" />
      },
      {
        title: "Kazanmaya Başla",
        description: "Yakında: Yazarlar olarak kazanç sağlayın, okuyucular olarak premium içeriklere erişin.",
        icon: <Award className="h-8 w-8" />
      }
    ]
  
    return (
      <section className="py-8">
        <div className="container">
          <h2 className="text-4xl font-bold mb-4 text-center">Nasıl Çalışır?</h2>
          <p className="text-xl text-muted-foreground mb-12 text-center">
            Folory'yi kullanmak çok kolay
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
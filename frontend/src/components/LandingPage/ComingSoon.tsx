import { DollarSign, Users } from "lucide-react";

export function ComingSoon() {
    return (
      <section className="py-8" id="coming-soon">
        <div className="container">
          <h2 className="text-4xl font-bold mb-4 text-center">Yakında Gelecekler</h2>
          <p className="text-xl text-muted-foreground mb-12 text-center">
            Platformumuzu daha da geliştiriyoruz!
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-primary/5 to-background">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">Yazarlar için Kazanç Modeli</h3>
              </div>
              <p className="text-muted-foreground">
                Okuyucularınızdan destek alın, premium içerikler satın, yazarlık kariyerinizi geliştirin.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-secondary/5 to-background">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-secondary" />
                <h3 className="font-semibold">Topluluk Özellikleri</h3>
              </div>
              <p className="text-muted-foreground">
                Yazarlar için özel topluluklar, okuyucularla doğrudan etkileşim imkanı.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }
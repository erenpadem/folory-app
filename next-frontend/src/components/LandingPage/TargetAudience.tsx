import { BarChart, Bell, BookOpen, Bookmark, DollarSign, FileText, Heart, Pen } from "lucide-react";

export function TargetAudience() {
    return (
      <section className="py-8">
        <div className="container grid grid-cols-12 gap-6">
          {/* Yazarlar - Primary Tema */}
          <div className="col-span-12 md:col-span-6 bg-primary/10 p-8 rounded-xl border border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary h-10 w-10 rounded-full flex items-center justify-center">
                <Pen className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-primary">Yazarlar İçin</h2>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <FileText className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Profesyonel Dışa Aktarma</h3>
                  <p className="text-muted-foreground">
                    Hikayelerinizi Word/PDF olarak tek tıkla dışa aktarın
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <BarChart className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Detaylı Analitikler</h3>
                  <p className="text-muted-foreground">
                    Okuyucu davranışlarını anlık takip edin
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <DollarSign className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Kazanç Potansiyeli</h3>
                  <p className="text-muted-foreground">
                    Yakında: Okuyuculardan destek alabileceksiniz
                  </p>
                </div>
              </li>
            </ul>
          </div>
  
          {/* Okuyucular - Secondary Tema */}
          <div className="col-span-12 md:col-span-6 bg-secondary/10 p-8 rounded-xl border border-secondary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-secondary h-10 w-10 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-secondary-foreground" />
              </div>
              <h2 className="text-3xl font-bold text-secondary">Okuyucular İçin</h2>
            </div>
            
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <Bookmark className="h-6 w-6 text-secondary mt-1" />
                <div>
                  <h3 className="font-semibold">Kişisel Kütüphane</h3>
                  <p className="text-muted-foreground">
                    Beğendiğiniz hikayeleri kaydedin
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Heart className="h-6 w-6 text-secondary mt-1" />
                <div>
                  <h3 className="font-semibold">Etkileşim</h3>
                  <p className="text-muted-foreground">
                    Beğeni ve yorumlarla yazarları destekleyin
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Bell className="h-6 w-6 text-secondary mt-1" />
                <div>
                  <h3 className="font-semibold">Takip Sistemi</h3>
                  <p className="text-muted-foreground">
                    Favori yazarlarınızın yeni içeriklerini kaçırmayın
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    )
  }
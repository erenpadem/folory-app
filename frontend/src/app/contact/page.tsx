import { Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@radix-ui/react-label"

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">İletişim</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-2">E-posta</h2>
                <p className="text-muted-foreground">destek@fo-lory.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Telefon</h2>
                <p className="text-muted-foreground">+90 555 123 45 67</p>
                <p className="text-sm text-muted-foreground/80 mt-1">Hafta içi 09:00 - 18:00</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Adres</h2>
                <p className="text-muted-foreground">
                  Teknopark İstanbul<br />
                  Sanayi Mah. Teknopark Bulvarı No:1/3A<br />
                  34906 Pendik/İstanbul
                </p>
              </div>
            </div>
          </div>

          <div>
            <form className="space-y-4">
              <div>
                <Label htmlFor="name">Adınız Soyadınız</Label>
                <Input id="name" placeholder="Ad ve soyad" />
              </div>
              <div>
                <Label htmlFor="email">E-posta Adresiniz</Label>
                <Input id="email" type="email" placeholder="email@ornek.com" />
              </div>
              <div>
                <Label htmlFor="subject">Konu</Label>
                <Input id="subject" placeholder="Konu başlığı" />
              </div>
              <div>
                <Label htmlFor="message">Mesajınız</Label>
                <Textarea id="message" rows={5} placeholder="Mesajınızı buraya yazın..." />
              </div>
              <Button type="submit" className="w-full">Gönder</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
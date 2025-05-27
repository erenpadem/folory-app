'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {AuthForm} from '@/components/Auth/AuthForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import MeshBackground from '@/components/Styling/MeshBackground'

export default function VerifyPhonePage() {
  return (
    <div className="flex items-center justify-center h-screen relative">
       <MeshBackground/>
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Telefon Doğrulama</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm
            type="verify"
            onSubmit={(data) => console.log(data)}
          />
          <Button variant="link" className="w-full mt-4" asChild>
            <Link href="/auth/login">Giriş sayfasına dön</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
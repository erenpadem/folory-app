'use client'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image'
import ThemeChanger from './theme-switcher'

const Navbar = () => {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <>
            {/* Desktop Navbar */}
            <div className='hidden md:flex items-center justify-between w-full'>
                <div>
                    <Link className='text-2xl font-bold flex items-center gap-2' href={'/'}>

                        Folory
                    </Link>
                </div>
                <div className='gap-x-6 flex items-center'>
                    <Link className='hover:opacity-80 transition-colors' href={'/'}>Nasıl Çalışır?</Link>
                    <Link className='hover:opacity-80 transition-colors' href={'/'}>Blog</Link>
                    <Link className='hover:opacity-80 transition-colors' href={'/'}>Yakında</Link>

                    {/* Auth Dialog */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size={'sm'} variant={'secondary'}>Hemen Katıl</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] transition-all">
                            <Tabs defaultValue="login" className="w-full ">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                                    <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                                </TabsList>

                                <TabsContent value="login" className="mt-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-posta</Label>
                                            <Input id="email" type="email" placeholder="email@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Şifre</Label>
                                            <Input id="password" type="password" placeholder="••••••••" />
                                        </div>
                                        <Button className="w-full mt-2">Giriş Yap</Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="register" className="mt-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Ad Soyad</Label>
                                            <Input id="name" placeholder="Adınız ve soyadınız" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-email">E-posta</Label>
                                            <Input id="new-email" type="email" placeholder="email@example.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">Şifre</Label>
                                            <Input id="new-password" type="password" placeholder="••••••••" />
                                        </div>
                                        <Button className="w-full mt-2">Kayıt Ol</Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </DialogContent>
                    </Dialog>
                    <ThemeChanger />
                </div>
            </div>

            {/* Mobile Navbar */}
            <div className='flex md:hidden items-center justify-between w-full'>
                <Link className='text-2xl font-bold flex items-center gap-2' href={'/'}>

                    Folory
                </Link>

                <Drawer direction="right">
                    <DrawerTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-full top-0 right-0 left-auto mt-0 w-[300px] rounded-none">
                        <div className="p-6 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src="/assets/logo.png" width={32} height={32} alt="Folory Logo" />
                                    <span className="font-bold text-lg">Folory</span>
                                </div>
                                <ThemeChanger />
                            </div>

                            <div className="space-y-4">
                                <Link href={'/'} className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent">
                                    Nasıl Çalışır?
                                </Link>
                                <Link href={'/'} className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent">
                                    Blog
                                </Link>
                                <Link href={'/'} className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent">
                                    Yakında
                                </Link>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="secondary" className="w-full">
                                        Hemen Katıl
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Hemen aramıza katıl</DialogTitle>
                                    </DialogHeader>

                                    <Tabs defaultValue="login" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                                            <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="login" className="mt-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="mobile-email">E-posta</Label>
                                                    <Input id="mobile-email" type="email" placeholder="email@example.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="mobile-password">Şifre</Label>
                                                    <Input id="mobile-password" type="password" placeholder="••••••••" />
                                                </div>
                                                <Button className="w-full mt-2">Giriş Yap</Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="register" className="mt-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="mobile-name">Ad Soyad</Label>
                                                    <Input id="mobile-name" placeholder="Adınız ve soyadınız" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="mobile-new-email">E-posta</Label>
                                                    <Input id="mobile-new-email" type="email" placeholder="email@example.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="mobile-new-password">Şifre</Label>
                                                    <Input id="mobile-new-password" type="password" placeholder="••••••••" />
                                                </div>
                                                <Button className="w-full mt-2">Kayıt Ol</Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
        </>
    )
}

export default Navbar
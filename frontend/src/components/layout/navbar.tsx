'use client'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Menu, Sun, Moon, User, LogOut } from 'lucide-react'
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
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
    const { theme, setTheme } = useTheme()
    const { user, login, register, logout, loading } = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    const handleLogin = async () => {
        try {
            await login({ email, password })
            toast.success('Giriş başarılı')
            setIsDialogOpen(false)
            setEmail('')
            setPassword('')
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Giriş başarısız')
        }
    }

    const handleRegister = async () => {
        try {
            await register({ name, email, password, password_confirmation: password })
            toast.success('Kayıt başarılı, giriş yapabilirsiniz')
            setIsDialogOpen(false)
            setName('')
            setEmail('')
            setPassword('')
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Kayıt başarısız')
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            toast.success('Çıkış yapıldı')
            router.push('/')
        } catch (error: any) {
            toast.error('Çıkış sırasında bir hata oluştu')
        }
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
                    <Link className='hover:opacity-80 transition-colors' href={'#how-it-works'}>Nasıl Çalışır?</Link>
                     <Link className='hover:opacity-80 transition-colors' href={'/explore'}>Keşfet</Link>
                    <Link className='hover:opacity-80 transition-colors' href={'#coming-soon'}>Yakında</Link>

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>
                                            {user.name ? user.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuItem className="flex flex-col items-start">
                                    <div className="text-sm font-medium">{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/profile')}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Çıkış Yap</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size={'sm'} variant={'secondary'}>Hemen Katıl</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] transition-all">
                                    <Tabs defaultValue="login" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                                            <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="login" className="mt-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">E-posta</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Şifre</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>
                                                <Button
                                                    className="w-full mt-2"
                                                    onClick={handleLogin}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                                </Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="register" className="mt-4">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Ad Soyad</Label>
                                                    <Input
                                                        id="name"
                                                        placeholder="Adınız ve soyadınız"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="new-email">E-posta</Label>
                                                    <Input
                                                        id="new-email"
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="new-password">Şifre</Label>
                                                    <Input
                                                        id="new-password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                </div>
                                                <Button
                                                    className="w-full mt-2"
                                                    onClick={handleRegister}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </DialogContent>
                            </Dialog>
                            <ThemeChanger />
                        </>
                    )}
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

                            {user ? (
                                <div className="space-y-4">
                                    <Link
                                        href="/profile"
                                        className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent"
                                    >
                                        Profil
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={handleLogout}
                                        disabled={loading}
                                    >
                                        {loading ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
                                    </Button>
                                </div>
                            ) : (
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                                                        <Input
                                                            id="mobile-email"
                                                            type="email"
                                                            placeholder="email@example.com"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="mobile-password">Şifre</Label>
                                                        <Input
                                                            id="mobile-password"
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button
                                                        className="w-full mt-2"
                                                        onClick={handleLogin}
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                                                    </Button>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="register" className="mt-4">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="mobile-name">Ad Soyad</Label>
                                                        <Input
                                                            id="mobile-name"
                                                            placeholder="Adınız ve soyadınız"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="mobile-new-email">E-posta</Label>
                                                        <Input
                                                            id="mobile-new-email"
                                                            type="email"
                                                            placeholder="email@example.com"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="mobile-new-password">Şifre</Label>
                                                        <Input
                                                            id="mobile-new-password"
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button
                                                        className="w-full mt-2"
                                                        onClick={handleRegister}
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                                                    </Button>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
        </>
    )
}

export default Navbar
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '../ui/button'
import { Menu, User, LogOut, LayoutDashboard, Bookmark, Bell, Settings, CircleUser, LogIn, UserPlus } from 'lucide-react'
import {
    Drawer,
    DrawerContent,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import Image from 'next/image'
import ThemeChanger from './theme-switcher'
import { useAuth } from '@/features/auth'
import { useNotifications } from '@/hooks/use-notifications'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { buildLoginUrl, getCurrentReturnTo } from '@/lib/auth-redirect'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import { useBookEditorStore } from '@/features/books/presentation/stores/book-editor.store'
import {
    BookWizardStepper,
    BOOK_WIZARD_STEPS,
} from '@/features/books/presentation/components/wizard/book-wizard-stepper'
import { clearWizardWriteContextParams } from '@/features/books/presentation/utils/wizard-write-url'
import { useScrollHideHeader } from '@/hooks/use-scroll-hide-header'

const Navbar = () => {
    const { user, logout, loading } = useAuth()
    const { unreadCount } = useNotifications()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        setMobileMenuOpen(false)
    }, [pathname])

    const isBookWizardRoute =
        pathname === '/dashboard/books/new' ||
        (pathname?.startsWith('/dashboard/books/update/') ?? false)

    const scrollHideNav = useScrollHideHeader(isBookWizardRoute)
    const currentStep = useBookEditorStore((s) => s.currentStep)
    const setCurrentStep = useBookEditorStore((s) => s.setCurrentStep)

    /** Kitap sihirbazı yazım adımı: tam ekran editör, üst bar gizli */
    const isBookWizardWriteStep = isBookWizardRoute && currentStep === 4
    if (isBookWizardWriteStep) {
        return null
    }

    const handleScroll = (sectionId: string) => {
        if (pathname === '/') {
            const section = document.querySelector(sectionId)
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' })
            }
        } else {
            router.push(`/${sectionId}`)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            toast.success('Çıkış yapıldı')
            router.push('/')
        } catch {
            toast.error('Çıkış sırasında bir hata oluştu')
        }
    }

    const navigateToAuth = (tab: 'login' | 'register') => {
        const rt = getCurrentReturnTo()
        const returnTo = rt === '/' ? undefined : rt
        router.push(
            tab === 'register'
                ? buildLoginUrl({ tab: 'register', returnTo })
                : buildLoginUrl({ returnTo })
        )
    }

    const syncWizardStepUrl = (step: number) => {
        if (typeof window === 'undefined') return
        const onUpdate = pathname?.startsWith('/dashboard/books/update/')
        const onNew = pathname === '/dashboard/books/new'
        if (!onUpdate && !onNew) return
        const url = new URL(window.location.href)
        url.searchParams.set('step', String(step))
        if (step !== 4) {
            clearWizardWriteContextParams(url)
        }
        router.replace(url.pathname + url.search, { scroll: false })
    }

    const handleWizardStepClick = (step: number) => {
        if (step > currentStep) return
        setCurrentStep(step)
        syncWizardStepUrl(step)
    }

    return (
        <>
            {isBookWizardRoute && (
                <div className="h-[7.25rem] md:h-[4rem] shrink-0" aria-hidden />
            )}
            <div
                className={cn(
                    isBookWizardRoute
                        ? cn(
                              'fixed top-0 left-0 right-0 z-50 px-8 transition-transform duration-300 ease-out',
                              'bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm',
                              scrollHideNav && '-translate-y-full'
                          )
                        : 'contents'
                )}
            >
                <div
                    className={cn(
                        isBookWizardRoute
                            ? 'max-w-5xl mx-auto w-full py-2 md:py-1.5'
                            : 'contents'
                    )}
                >
            {/* Desktop Navbar */}
            <div
                className={cn(
                    'hidden md:flex w-full items-center',
                    isBookWizardRoute ? 'gap-2 md:gap-4' : 'justify-between'
                )}
            >
                <div className="shrink-0">
                    <Link className='text-2xl font-bold flex items-center gap-2' href={'/'}>
                        Folory
                    </Link>
                </div>

                {isBookWizardRoute && (
                    <div className="flex-1 flex justify-center min-w-0 px-1 md:px-2">
                        <BookWizardStepper
                            steps={BOOK_WIZARD_STEPS}
                            currentStep={currentStep}
                            onStepClick={handleWizardStepClick}
                        />
                    </div>
                )}

                <div className={cn('gap-x-6 flex items-center', isBookWizardRoute && 'shrink-0')}>
                    <button
                        onClick={() => handleScroll('#how-it-works')}
                        className='hover:opacity-80 transition-colors flex items-center gap-2'
                    >
                        Nasıl Çalışır?
                    </button>
                    <Link className='hover:opacity-80 transition-colors' href={'/explore'}>
                        Keşfet
                    </Link>
                    <button
                        onClick={() => handleScroll('#coming-soon')}
                        className='hover:opacity-80 transition-colors'
                    >
                        Yakında
                    </button>
                    {user && (
                        <>
                            {user.role === 'author' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/dashboard')}
                                    className="gap-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Panel
                                </Button>
                            )}
                        </>
                    )}

                    {user ? (
                        <div className="flex items-center gap-2">
                            <ThemeChanger />
                            {/* Notifications button for all users */}
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => router.push('/notifications')}
                                className="relative"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar || undefined} alt={user.name} />
                                            <AvatarFallback className={getAvatarColor(user.name)}>
                                                {user.name ? getInitials(user.name) : <User className="h-4 w-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuItem className="flex flex-col items-start pointer-events-none">
                                        <div className="text-sm font-medium">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                        {user.role && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {user.role === 'author' ? 'Yazar' : 'Okuyucu'}
                                            </div>
                                        )}
                                    </DropdownMenuItem>
                                    
                                    {/* Dashboard for authors */}
                                    {user.role === 'author' && (
                                        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Panel</span>
                                        </DropdownMenuItem>
                                    )}
                                    
                                    {/* Profile for all users */}
                                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profil</span>
                                    </DropdownMenuItem>
                                    
                                    {/* Saved and Notifications for readers only */}
                                    {user.role !== 'author' && (
                                        <>
                                            <DropdownMenuItem onClick={() => router.push('/profile?tab=saved')}>
                                                <Bookmark className="mr-2 h-4 w-4" />
                                                <span>Kaydedilenler</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push('/notifications')}>
                                                <Bell className="mr-2 h-4 w-4" />
                                                <span>Bildirimler</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    
                                    {/* Settings for all users */}
                                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Ayarlar</span>
                                    </DropdownMenuItem>
                                    
                                    <div className="border-t my-1" />
                                    
                                    <DropdownMenuItem 
                                        onClick={handleLogout}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Çıkış Yap</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full border border-border/60 text-foreground hover:bg-accent"
                                        aria-label="Hesap menüsü"
                                    >
                                        <CircleUser className="h-6 w-6" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48" align="end">
                                    <DropdownMenuItem onSelect={() => navigateToAuth('login')}>
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Giriş Yap
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => navigateToAuth('register')}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Kayıt Ol
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <ThemeChanger />
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Navbar */}
            <div
                className={cn(
                    'md:hidden',
                    isBookWizardRoute ? 'flex flex-col gap-2 w-full' : 'flex items-center justify-between w-full'
                )}
            >
                <div className="flex items-center justify-between w-full">
                <Link className='text-2xl font-bold flex items-center gap-2' href={'/'}>
                    Folory
                </Link>

                <Drawer
                    direction="right"
                    open={mobileMenuOpen}
                    onOpenChange={setMobileMenuOpen}
                >
                    <DrawerTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-full top-0 right-0 left-auto mt-0 w-[300px] rounded-none">
                        <div className="p-6 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Image src="/assets/logo.svg" width={32} height={32} alt="" aria-hidden priority />
                                    <DrawerTitle className="font-bold text-lg">Folory</DrawerTitle>
                                </div>
                                <ThemeChanger />
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => handleScroll('#how-it-works')}
                                    className="block w-full text-left hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent"
                                >
                                    Nasıl Çalışır?
                                </button>
                                <Link href={'/explore'} className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent">
                                    Keşfet
                                </Link>
                                <button
                                    onClick={() => handleScroll('#coming-soon')}
                                    className="block w-full text-left hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent"
                                >
                                    Yakında
                                </button>
                            </div>

                            {user ? (
                                <div className="space-y-4">
                                    {/* User info */}
                                    <div className="pb-4 border-b">
                                        <div className="text-sm font-medium">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                        {user.role && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {user.role === 'author' ? 'Yazar' : 'Okuyucu'}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Dashboard for authors */}
                                    {user.role === 'author' && (
                                        <Link
                                            href="/dashboard"
                                            className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent"
                                        >
                                            <LayoutDashboard className="inline mr-2 h-4 w-4" />
                                            Panel
                                        </Link>
                                    )}
                                    
                                    {/* Profile for all users */}
                                    <Link
                                        href="/profile"
                                        className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent"
                                    >
                                        <User className="inline mr-2 h-4 w-4" />
                                        Profil
                                    </Link>
                                    
                                    {/* Saved and Notifications for readers only */}
                                    {user.role !== 'author' && (
                                        <>
                                            <Link
                                                href="/profile?tab=saved"
                                                className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent"
                                            >
                                                <Bookmark className="inline mr-2 h-4 w-4" />
                                                Kaydedilenler
                                            </Link>
                                            <Link
                                                href="/notifications"
                                                className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent"
                                            >
                                                <Bell className="inline mr-2 h-4 w-4" />
                                                Bildirimler
                                            </Link>
                                        </>
                                    )}
                                    
                                    {/* Settings for all users */}
                                    <Link
                                        href="/settings"
                                        className="block hover:opacity-80 transition-colors p-3 rounded-lg hover:bg-accent"
                                    >
                                        <Settings className="inline mr-2 h-4 w-4" />
                                        Ayarlar
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
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2"
                                        onClick={() => navigateToAuth('login')}
                                    >
                                        <LogIn className="h-4 w-4" />
                                        Giriş Yap
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="w-full justify-start gap-2"
                                        onClick={() => navigateToAuth('register')}
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Kayıt Ol
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DrawerContent>
                </Drawer>
                </div>
                {isBookWizardRoute && (
                    <div className="w-full max-w-full overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex justify-center min-w-[min(100%,18rem)] mx-auto">
                            <BookWizardStepper
                                compact
                                steps={BOOK_WIZARD_STEPS}
                                currentStep={currentStep}
                                onStepClick={handleWizardStepClick}
                            />
                        </div>
                    </div>
                )}
            </div>
                </div>
            </div>
        </>
    )
}

export default Navbar

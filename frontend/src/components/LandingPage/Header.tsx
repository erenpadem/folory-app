"use client"
import React from 'react'
import { Button } from "@/components/ui/button"
import Image from "next/image";
import { useRouter } from 'next/navigation'

export default function Header() {
    const router = useRouter();

    const navigateToExplore = () => {
        router.push('explore')
    }
    const navigateToWrite
        = () => {
            router.push('/auth/login')
        }
    return (
        <div className="relative py-10 bg grid grid-cols-12 items-start justify-between min-h-[80vh]">
            {/* Gradient Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-primary via-muted-foreground/5 to-muted-foreground"
                    style={{
                        maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 70%)'
                    }}
                />
            </div>

            <div className="grid col-span-12 md:col-span-4 items-start py-20  flex-col gap-y-8">

                <h1 className="text-6xl text-center md:text-left font-semibold">Yaz. Oku. Kazan.</h1>
                <div>
                    <h3 className="text-md">
                        <span className="font-bold">Hikayeni paylaş</span> <span className="text-secondary font-bold">Okuyucudan destek al </span>
                        ve <span className="font-bold">Folory</span> ile kazanç sağlamaya başla.
                    </h3>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-x-3">
                    <Button onClick={ () => navigateToWrite()} size={'lg'} variant={'default'}>Başla</Button>
                    <Button onClick={ () => navigateToExplore()} size={'lg'} variant={'secondary'} >Keşfet</Button>
                </div>
            </div>
            <div className="col-span-8 hidden md:flex items-center justify-end">
                <Image src={'/assets/header.png'} alt="header-test" width={500} height={500} />
            </div>
        </div>
    )
}

'use client'

/**
 * Folory sekme düzeni — üst şerit (segmented) + içerik aralığı.
 * Yeni sekme kullanırken: AppTabs → AppTabsList → AppTabsTrigger, içerik AppTabsContent + isteğe SurfacePanel.
 */

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

function AppTabs({
  className,
  ...props
}: React.ComponentProps<typeof Tabs>) {
  return (
    <Tabs
      className={cn('w-full gap-0', className)}
      {...props}
    />
  )
}

const listBase = cn(
  'h-auto min-h-11 w-full gap-1 rounded-xl border border-border/45 bg-muted/50 p-1 shadow-sm',
  'dark:border-border/55 dark:bg-muted/35',
  '[&_[data-slot=tabs-trigger]]:rounded-lg [&_[data-slot=tabs-trigger]]:text-sm [&_[data-slot=tabs-trigger]]:font-medium',
  '[&_[data-slot=tabs-trigger]]:text-muted-foreground [&_[data-slot=tabs-trigger][data-state=active]]:bg-background',
  '[&_[data-slot=tabs-trigger][data-state=active]]:text-foreground [&_[data-slot=tabs-trigger][data-state=active]]:shadow-sm',
  'dark:[&_[data-slot=tabs-trigger][data-state=active]]:bg-input/40 dark:[&_[data-slot=tabs-trigger][data-state=active]]:text-foreground'
)

function AppTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn(listBase, className)}
      {...props}
    />
  )
}

function AppTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        'px-3 py-2.5 transition-colors sm:px-4',
        className
      )}
      {...props}
    />
  )
}

function AppTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsContent>) {
  return (
    <TabsContent
      className={cn(
        'mt-6 outline-none animate-in fade-in-0 duration-200',
        className
      )}
      {...props}
    />
  )
}

export {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
  AppTabsContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
}

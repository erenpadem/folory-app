import { useTheme } from 'next-themes'
import { Button } from '../ui/button'
import { Moon, Sun } from 'lucide-react'
import React from 'react'

const ThemeChanger = () => {
    const [mounted, setMounted] = React.useState(false)
    const { theme, setTheme } = useTheme()

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    if (!mounted) {
        return null
    }

    return (
        <div>
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-secondary/10"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                ) : (
                    <Moon className="h-5 w-5" />
                )}
            </Button>
        </div>
    )
}

export default ThemeChanger
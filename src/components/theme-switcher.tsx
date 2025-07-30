"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SidebarItem, SidebarLabel } from '@/components/sidebar'
import { MoonIcon, SunIcon } from '@heroicons/react/16/solid'


const ThemeSwitcher = () => {
    const [mounted, setMounted] = useState(false);
    const {systemTheme, theme, setTheme} = useTheme();
    const currentTheme = theme === "system" ? systemTheme : theme;
    
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <SidebarItem>
                <SunIcon className="sun h-6 w-6 text-yellow-500" />
                <SidebarLabel>Dark/Light Mode</SidebarLabel>
            </SidebarItem>
        );
    }

    return (
        <SidebarItem onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}>
            <SunIcon className="sun h-6 w-6 text-yellow-500 dark:hidden" />
            <MoonIcon className="moon h-6 w-6 text-gray-900 dark:text-gray-100 hidden dark:block" />
            <SidebarLabel>Dark/Light Mode</SidebarLabel>
        </SidebarItem>
    );
};

export default ThemeSwitcher;
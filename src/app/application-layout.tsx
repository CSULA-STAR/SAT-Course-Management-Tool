'use client'

import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import { Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer } from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { AcademicCapIcon, BookOpenIcon, BuildingOfficeIcon, Square2StackIcon, ArrowRightStartOnRectangleIcon, UserCircleIcon, StarIcon, MoonIcon, SunIcon } from '@heroicons/react/16/solid'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react';

function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
    <DropdownItem href="#">
        <UserCircleIcon />
        <DropdownLabel>My account</DropdownLabel>
    </DropdownItem>
    <DropdownDivider />
    <DropdownItem href="#">
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
    </DropdownItem>
    </DropdownMenu>
)}

export function ApplicationLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();    // dark theme switcher
    const userTheme = localStorage.getItem("theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const [isDarkMode, setIsDarkMode] = useState(userTheme === "dark" || (!userTheme && systemTheme));
    const themeSwitch = () => {
        if (document.documentElement.classList.contains("dark")){
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setIsDarkMode(false);
            return;
        }
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        setIsDarkMode(true);
    };

    useEffect(() => {
        if (userTheme === "dark" || (!userTheme && systemTheme)){
            document.documentElement.classList.add("dark");
        }
    }, []);

    return (
        <SidebarLayout
        navbar={
            <Navbar>
            <NavbarSpacer />
            <NavbarSection>
                <Dropdown>
                <DropdownButton as={NavbarItem}>
                </DropdownButton>
                <AccountDropdownMenu anchor="bottom end" />
                </Dropdown>
            </NavbarSection>
            </Navbar>
        }
        sidebar={
            <Sidebar>
            <SidebarItem disabled={true} className='dark:bg-yellow-500'>
                <img src="https://westernpsych.org/wp-content/uploads/2018/09/csula-logo-rectangle-brand_horizontal_logo_4color.png" alt="Logo" />
                <SidebarLabel>Logo</SidebarLabel>
            </SidebarItem>
            <SidebarHeader>
                <SidebarItem href="/" current={pathname === '/'}>
                <StarIcon />
                <SidebarLabel>STAR Advisement Tools</SidebarLabel>
                </SidebarItem>
            </SidebarHeader>

            <SidebarBody>
                <SidebarSection>
                <SidebarItem href="/csulacourses" current={pathname.startsWith('/csulacourses')}>
                    <BookOpenIcon />
                    <SidebarLabel>CSULA Courses</SidebarLabel>
                </SidebarItem>
                
                <SidebarItem href="/courses" current={pathname.startsWith('/courses')}>
                    <BookOpenIcon />
                    <SidebarLabel>Courses</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/programs" current={pathname.startsWith('/programs')}>
                    <Square2StackIcon />
                    <SidebarLabel>Programs</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/institutions" current={pathname.startsWith('/institutions')}>
                    <AcademicCapIcon />
                    <SidebarLabel>Institutions</SidebarLabel>
                </SidebarItem>
                </SidebarSection>
                
                <SidebarSpacer />

                <SidebarSection>
                <SidebarItem href="/account" current={pathname.startsWith('/account')}>
                    <UserCircleIcon />
                    <SidebarLabel>My Account</SidebarLabel>
                </SidebarItem>
                <SidebarItem onClick={themeSwitch}>
                    {isDarkMode ? (
                        <SunIcon className="sun h-6 w-6 text-yellow-500" />
                    ) : (
                        <MoonIcon className="moon h-6 w-6 text-gray-900 dark:text-gray-100" />
                    )}
                    <SidebarLabel>Dark/Light Mode</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="#">
                    <ArrowRightStartOnRectangleIcon />
                    <SidebarLabel>Sign out</SidebarLabel>
                </SidebarItem>
                </SidebarSection>
            </SidebarBody>

            </Sidebar>
        }
        >
        {children}
        </SidebarLayout>
    )
}

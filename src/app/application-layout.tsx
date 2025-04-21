'use client'

import { Dropdown, DropdownButton, DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import { Sidebar, SidebarBody, SidebarHeader, SidebarItem, SidebarLabel, SidebarSection, SidebarSpacer } from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { AcademicCapIcon, BookOpenIcon, Square2StackIcon, ArrowRightStartOnRectangleIcon, UserCircleIcon, StarIcon } from '@heroicons/react/16/solid'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import ThemeSwitcher from "@/components/theme-switcher";

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
    const pathname = usePathname();

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
            <Image 
                src="/csula-logo.png" alt="Logo"
                width={200} height={50}
            />
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
                    {/* <SidebarItem href="/account" current={pathname.startsWith('/account')}>
                        <UserCircleIcon />
                        <SidebarLabel>My Account</SidebarLabel>
                    </SidebarItem> */}
                    <ThemeSwitcher />
                    {/* <SidebarItem href="#">
                        <ArrowRightStartOnRectangleIcon />
                        <SidebarLabel>Sign out</SidebarLabel>
                    </SidebarItem> */}
                </SidebarSection>
            </SidebarBody>

            </Sidebar>
        }
        >
        {children}
        </SidebarLayout>
    )
}

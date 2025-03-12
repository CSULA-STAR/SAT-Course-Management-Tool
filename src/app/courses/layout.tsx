'use client';
import { usePathname } from 'next/navigation';
import { Divider } from '@/components/divider';
import { PlusIcon } from '@heroicons/react/16/solid'

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();

    return (
        <div className="mx-auto max-w-6xl">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">
                    Courses
                </h1>
                {pathname.endsWith('/courses') && (
                    <div className="flex justify-end mt-4">
                    <a
                        href="/courses/add"
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bule-600"
                    >
                    <PlusIcon aria-hidden="true" className="-ml-0.5 size-5" />
                    Add Course
                    </a>
                    </div>
                )}
            </div>

            <Divider className="mt-6" />
            <div>{children}</div>
        </div>
    );
}
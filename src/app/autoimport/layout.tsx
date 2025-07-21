'use client';
import { Divider } from '@/components/divider';

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <div className="mx-auto max-w-6xl">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">
                    Courses Auto Import
                </h1>
            </div>

            <Divider className="mt-6" />
            <div>{children}</div>
        </div>
    );
}
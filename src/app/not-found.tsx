import Link from 'next/link'
 
export default function NotFound() {
    return (
        <div className="flex justify-center items-start h-screen">
            <div className="mt-[10vh] text-center">
                <h1 className="text-3xl font-bold dark:text-white">
                    Not Found!
                </h1>
                <p className="mt-[2vh]">Could not find requested resource</p>
                <Link className="font-bold underline hover: hover:text-blue-500" href="/">Return Home</Link>
            </div>
        </div>
    )
}
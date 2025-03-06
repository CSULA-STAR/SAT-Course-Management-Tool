export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">
            Account
        </h1>
        <hr className="mt-6 w-full border-t border-zinc-950/10 dark:border-white/10"></hr>
        <div>{children}</div>
    </div>
  );
}

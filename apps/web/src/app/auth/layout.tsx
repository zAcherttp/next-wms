export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background">
      <div>{children}</div>
    </div>
  );
}

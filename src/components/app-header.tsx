import { ThemeToggle } from "@/components/theme-toggle"

export function AppHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 w-full max-w-[640px] items-center justify-between px-4">
        <p className="text-xl font-semibold">Aufgaben</p>
        <ThemeToggle />
      </div>
    </header>
  )
}

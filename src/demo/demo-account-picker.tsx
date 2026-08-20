import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { withAppBase } from "@/lib/route-base"

export type DemoAccountSelection = {
  email: string
  password: string
}

type DemoAccountOption = {
  className: string
  cycle: "Collège" | "Lycée" | "Primaire"
  email: string
  name: string
  photoUrl: string
  studentId: "boris" | "clara" | "mireille"
}

const DEMO_PASSWORD = "DemoLernn2026!"

const DEMO_ACCOUNT_OPTIONS: readonly DemoAccountOption[] = [
  {
    studentId: "clara",
    name: "Clara Makaya",
    className: "CE1-A",
    cycle: "Primaire",
    email: "clara.makaya.demo@ndg.lernn.local",
    photoUrl: "/student-photos/girl-01.png",
  },
  {
    studentId: "boris",
    name: "Boris Mbemba",
    className: "5E-A",
    cycle: "Collège",
    email: "boris.mbemba.demo@ndg.lernn.local",
    photoUrl: "/student-photos/boy-03.png",
  },
  {
    studentId: "mireille",
    name: "Mireille Nsimba",
    className: "TERM-D",
    cycle: "Lycée",
    email: "mireille.nsimba.demo@ndg.lernn.local",
    photoUrl: "/student-photos/girl-04.png",
  },
] as const

export function DemoAccountPicker({
  onSelect,
}: {
  onSelect: (credentials: DemoAccountSelection) => void
}) {
  return (
    <section
      aria-labelledby="demo-account-picker-title"
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <h2
          className="text-xs font-semibold text-foreground"
          id="demo-account-picker-title"
        >
          Comptes de démonstration
        </h2>
        <span className="text-[10px] font-medium text-muted-foreground">
          Préremplir
        </span>
      </div>

      <ul
        aria-label="Choisir un compte de démonstration"
        className="-mx-1 flex [scrollbar-width:none] gap-2 overflow-x-auto px-1 pb-1 [&::-webkit-scrollbar]:hidden"
      >
        {DEMO_ACCOUNT_OPTIONS.map((account) => (
          <li className="shrink-0" key={account.studentId}>
            <button
              aria-label={`Préremplir le compte de ${account.name}, ${account.className}, cycle ${account.cycle}`}
              className="flex min-h-14 min-w-44 items-center gap-3 rounded-xl border bg-background p-2 text-left outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-muted"
              onClick={() =>
                onSelect({ email: account.email, password: DEMO_PASSWORD })
              }
              type="button"
            >
              <Avatar className="size-10" size="lg">
                <AvatarImage
                  alt={`Photo de ${account.name}`}
                  src={withAppBase(account.photoUrl)}
                />
                <AvatarFallback className="bg-brand-soft font-semibold text-brand-dark">
                  {getInitials(account.name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">
                  {account.name}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                  {account.className} · {account.cycle}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

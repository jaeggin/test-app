import { Alert, AlertDescription } from "@/components/ui/alert"
import type { TasksState } from "./tasks.storage"

type Props = Pick<TasksState, "storage" | "unreadable">

export function StorageAlert({ storage, unreadable }: Props) {
  if (storage === "ok" && !unreadable) return null

  return (
    <div className="space-y-2">
      {storage === "unavailable" && (
        <Alert variant="destructive">
          <AlertDescription>
            Änderungen werden nicht gespeichert. Der Browserspeicher ist nicht verfügbar oder voll.
            Die Aufgaben bleiben nur erhalten, solange dieser Tab offen ist.
          </AlertDescription>
        </Alert>
      )}
      {unreadable && (
        <Alert variant="destructive">
          <AlertDescription>Gespeicherte Aufgaben konnten nicht gelesen werden.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

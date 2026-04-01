import { useState } from "react"
import { HexColorPicker } from "react-colorful"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

export function ColorPickerPopover({
  color,
  onChange
}: {
  color: string
  onChange: (newColor: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "w-5 h-5 rounded border shadow-sm",
            "cursor-pointer"
          )}
          style={{ backgroundColor: color }}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white p-3 rounded-lg shadow-xl z-50 border"
          sideOffset={5}
        >
          <HexColorPicker color={color} onChange={onChange} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

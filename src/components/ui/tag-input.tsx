import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  maxLength?: number
}

export function TagInput({
  value,
  onChange,
  placeholder,
  maxTags = 10,
  maxLength = 50,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("")

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tag = inputValue.trim()
      if (tag && !value.includes(tag) && value.length < maxTags) {
        onChange([...value, tag])
        setInputValue("")
      }
    }
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {value.map((tag, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="ml-0.5 rounded-sm p-0.5 hover:bg-muted-foreground/20"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      {value.length < maxTags && (
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.slice(0, maxLength))}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-8 text-xs"
        />
      )}
    </div>
  )
}

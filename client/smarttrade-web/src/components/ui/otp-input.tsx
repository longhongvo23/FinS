import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  // Split value into array
  const valueArray = value.split('').slice(0, length)
  while (valueArray.length < length) {
    valueArray.push('')
  }

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus()
      setActiveIndex(index)
    }
  }

  const handleChange = (index: number, char: string) => {
    if (disabled) return

    // Only allow digits
    if (char && !/^\d$/.test(char)) return

    const newValue = valueArray.slice()
    newValue[index] = char

    onChange(newValue.join(''))

    // Move to next input if char was entered
    if (char && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      if (valueArray[index]) {
        handleChange(index, '')
      } else if (index > 0) {
        focusInput(index - 1)
        handleChange(index - 1, '')
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusInput(index - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusInput(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return

    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pastedData) {
      onChange(pastedData)
      focusInput(Math.min(pastedData.length, length - 1))
    }
  }

  const handleFocus = (index: number) => {
    setActiveIndex(index)
    inputRefs.current[index]?.select()
  }

  return (
    <div className={cn('flex gap-2 justify-center', className)}>
      {valueArray.map((char, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={char}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          className={cn(
            'w-12 h-14 text-center text-2xl font-mono font-bold',
            'rounded-lg border-2 bg-surface-2',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            activeIndex === index && !disabled && 'border-brand ring-2 ring-brand/20',
            char && 'border-success bg-success/5',
            !char && 'border-border'
          )}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  )
}

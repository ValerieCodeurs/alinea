import {useContrastColor} from '@alinea/ui/hook/UseContrastColor'
import {Field} from 'alinea/core'
import {useField} from 'alinea/dashboard/editor/UseField'
import {useClickOutside} from 'alinea/dashboard/hook/useClickOutside'
import {IconButton} from 'alinea/dashboard/view/IconButton'
import {InputLabel} from 'alinea/dashboard/view/InputLabel'
import {fromModule, HStack} from 'alinea/ui'
import {IcRoundCheck} from 'alinea/ui/icons/IcRoundCheck'
import {IcRoundClear} from 'alinea/ui/icons/IcRoundClear'
import {IcRoundColorLens} from 'alinea/ui/icons/IcRoundColorLens'
import {useCallback, useEffect, useRef, useState} from 'react'
import {HexColorInput, HexColorPicker} from 'react-colorful'
import {ColorField, color as createColor} from './ColorField.js'
import css from './ColorField.module.scss'

export * from './ColorField.js'

export const color = Field.provideView(ColorInput, createColor)

const styles = fromModule(css)

interface AllowedColorPickerProps {
  selectedColor: string | null
  colors: Array<string>
  onChange: (color: string | null) => void
}

function AllowedColorPicker({
  selectedColor,
  colors,
  onChange
}: AllowedColorPickerProps) {
  const contrastColor = useContrastColor(selectedColor)
  const handleClick = (color: string | null) => () => onChange(color)
  return (
    <>
      <HStack center gap={8}>
        {colors.map(color => (
          <button
            key={color}
            className={styles.root.button()}
            style={{backgroundColor: color}}
            onClick={handleClick(color)}
          >
            {color === selectedColor && (
              <IcRoundCheck
                className={styles.root.button.check()}
                style={{color: contrastColor ?? undefined}}
              />
            )}
          </button>
        ))}
        {selectedColor && (
          <IconButton icon={IcRoundClear} onClick={handleClick(null)} />
        )}
      </HStack>
    </>
  )
}

interface AllColorPickerProps {
  color: string | null
  onChange: (color: string | null) => void
}

function AllColorPicker({color, onChange}: AllColorPickerProps) {
  const popover = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  useClickOutside(popover, close)
  return (
    <div className={styles.root.popover()}>
      <HStack center>
        <button
          onClick={() => setOpen(!open)}
          className={styles.root.popover.button()}
        >
          <HStack center>
            <div
              className={styles.root.popover.color({empty: !color})}
              style={{backgroundColor: color ?? undefined}}
            />
            <HexColorInput
              color={color ?? undefined}
              onChange={onChange}
              className={styles.root.popover.input({open: open})}
            />
          </HStack>
        </button>
        {color && (
          <IconButton
            className={styles.root.popover.clear()}
            icon={IcRoundClear}
            onClick={() => onChange(null)}
          />
        )}
      </HStack>
      {open && (
        <div ref={popover} className={styles.root.popover.panel()}>
          <HexColorPicker color={color ?? undefined} onChange={onChange} />
        </div>
      )}
    </div>
  )
}

interface ColorInputProps {
  field: ColorField
}

function ColorInput({field}: ColorInputProps) {
  const {options, value, mutator, error} = useField(field)
  const {allowedColors} = options
  const defaultValue = String(value ?? '')
  useEffect(() => {
    mutator(defaultValue)
  }, [defaultValue])
  return (
    <InputLabel asLabel {...options} error={error} icon={IcRoundColorLens}>
      {allowedColors ? (
        <AllowedColorPicker
          selectedColor={value}
          colors={allowedColors}
          onChange={mutator}
        />
      ) : (
        <AllColorPicker color={value} onChange={mutator} />
      )}
    </InputLabel>
  )
}

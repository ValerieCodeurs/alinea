import {FieldOptions, Hint, ScalarField, WithoutLabel} from 'alinea/core'

/** Optional settings to configure a color field */
export interface ColorOptions extends FieldOptions<string | null> {
  /** Width of the field in the dashboard UI (0-1) */
  width?: number
  /** Add instructional text to a field */
  help?: string
  /** Display a minimal version */
  inline?: boolean
  /** List of allowed hex codes */
  allowedColors?: Array<string>
}

export class ColorField extends ScalarField<string | null, ColorOptions> {}

export function color(
  label: string,
  options: WithoutLabel<ColorOptions> = {}
): ColorField {
  return new ColorField({
    hint: Hint.String(),
    options: {label, ...options}
  })
}

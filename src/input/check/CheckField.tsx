import {Field, Hint, Label, Shape} from 'alinea/core'

/** Optional settings to configure a check field */
export type CheckOptions = {
  /** Label displayed next to the checkbox  */
  label?: Label
  /** Width of the field in the dashboard UI (0-1) */
  width?: number
  /** Add instructional text to a field */
  help?: Label
  /** Field is optional */
  optional?: boolean
  /** Display a minimal version */
  inline?: boolean
  /** A default value */
  initialValue?: boolean
  /** Focus this input automatically */
  autoFocus?: boolean
  /** Hide this check field */
  hidden?: boolean
  /** Make this check field read-only*/
  readonly?: boolean
}

/** Internal representation of a check field */
export interface CheckField extends Field.Scalar<boolean> {
  label: Label
  options: CheckOptions
}

/** Create a text field configuration */
export function check(
  label: Label,
  options: CheckOptions = {label}
): CheckField {
  return {
    shape: Shape.Scalar(label, options.initialValue),
    hint: Hint.Boolean(),
    label,
    options,
    hidden: options.hidden
  }
}

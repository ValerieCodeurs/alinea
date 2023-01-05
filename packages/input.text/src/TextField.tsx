import {Field, Hint, Label, Shape} from '@alinea/core'
import type {ComponentType} from 'react'

/** Optional settings to configure a text field */
export type TextOptions = {
  /** Width of the field in the dashboard UI (0-1) */
  width?: number
  /** Add instructional text to a field */
  help?: Label
  /** Field is optional */
  optional?: boolean
  /** Allow line breaks */
  multiline?: boolean
  /** Display a minimal version */
  inline?: boolean
  /** A default value */
  initialValue?: string
  /** An icon (React component) to display on the left side of the input */
  iconLeft?: ComponentType
  /** An icon (React component) to display on the right side of the input */
  iconRight?: ComponentType
  /** Focus this input automatically */
  autoFocus?: boolean
  /** Hide this text field */
  hidden?: boolean
  /** Make this text field read-only */
  readonly?: boolean
}

/** Internal representation of a text field */
export interface TextField extends Field.Scalar<string> {
  label: Label
  options: TextOptions
}

/** Create a text field configuration */
export function createText(label: Label, options: TextOptions = {}): TextField {
  return {
    shape: Shape.Scalar(label, options.initialValue),
    hint: Hint.String(),
    label,
    options,
    hidden: options.hidden
  }
}

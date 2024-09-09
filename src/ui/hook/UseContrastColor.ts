import {useMemo} from 'react'
import {contrastColor} from '../util/ContrastColor.js'

export function useContrastColor(color: string | null): string | null {
  if (!color) return null
  return useMemo(() => contrastColor(color) || null, [color])
}

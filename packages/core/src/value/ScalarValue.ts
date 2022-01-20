import * as Y from 'yjs'
import {createError} from '../ErrorWithCode'
import {Value} from '../Value'

export class ScalarValue<T> implements Value<T> {
  static inst = new ScalarValue()
  constructor() {}
  create(): T {
    return undefined! as T
  }
  typeOfChild<C>(yValue: T, child: string): Value<C> {
    throw createError(`No children in scalar values`)
  }
  toY(value: T) {
    return value
  }
  fromY(yValue: any) {
    return yValue
  }
  watch(parent: Y.Map<any>, key: string) {
    return (fun: () => void) => {
      function w(event: Y.YMapEvent<any>) {
        if (event.keysChanged.has(key)) fun()
      }
      parent.observe(w)
      return () => parent.unobserve(w)
    }
  }
  mutator(parent: Y.Map<any>, key: string) {
    return (value: T) => parent.set(key, value)
  }
}

import {Entry, EntryStatus, Label, Type, Value} from '@alinea/core'
import {InputPath} from '@alinea/editor'
import {observable, Observable} from '@alinea/ui'
import * as Y from 'yjs'

const ROOT_KEY = 'root'

export enum PublishStatus {
  Published,
  Draft
}

export class EntryDraft implements Entry {
  public entry: Observable<Entry>
  private root: Y.Map<any>

  constructor(public channel: Type, public doc: Y.Doc) {
    this.root = doc.getMap(ROOT_KEY)
    this.entry = observable(this.getEntry())
  }

  connect() {
    const watch = () => this.entry(this.getEntry())
    this.doc.on('update', watch)
    return () => {
      this.doc.off('update', watch)
    }
  }

  getEntry(): Entry {
    return {
      id: this.id,
      $path: this.$path,
      type: this.type,
      title: this.title,
      ...this.channel.valueType.fromY(this.root)
    }
  }

  static get $path() {
    return new InputPath.EntryProperty<string>(['$path'])
  }
  static get type() {
    return new InputPath.EntryProperty<string>(['type'])
  }
  static get $status() {
    return new InputPath.EntryProperty<EntryStatus | undefined>(['$status'])
  }
  static get title() {
    return new InputPath.EntryProperty<string>(['title'])
  }

  get id(): string {
    return this.root.get('id')
  }

  get $path(): string {
    return this.root.get('$path')
  }

  get type(): string {
    return this.root.get('type')
  }

  get $status(): EntryStatus {
    return this.root.get('$status') || EntryStatus.Published
  }

  get title(): Label {
    return this.root.get('title')
  }

  getLocation(location: Array<string>) {
    let target = this.root
    let parent = target
    let type: Value = this.channel.valueType
    for (const key of location) {
      parent = target
      type = type.typeOfChild(target, key)
      target = target.get(key)
    }
    return {type, parent, target}
  }

  getInput<T>(location: Array<string>) {
    const key = location[location.length - 1]
    const {type, parent} = this.getLocation(location)
    return {
      mutator: type.mutator(parent, key),
      get value(): T {
        return type.fromY(parent.get(key))
      },
      observe: type.watch(parent, key)
    }
  }
}

import {Backend} from '@alinea/backend/Backend'
import {FileData} from '@alinea/backend/data/FileData'
import {JsonLoader} from '@alinea/backend/loader/JsonLoader'
import {JWTPreviews} from '@alinea/backend/util/JWTPreviews'
import {Config, Workspaces} from '@alinea/core'
import {Store} from '@alinea/store'
import {SqliteStore} from '@alinea/store/sqlite/SqliteStore'
import fs from 'node:fs/promises'
import path from 'node:path'
import {DevDrafts} from './DevDrafts'

export interface DevServerOptions<T extends Workspaces> {
  cwd?: string
  port?: number
  config: Config<T>
  createStore: () => Promise<Store>
  createDraftStore: () => Promise<SqliteStore>
}

export class DevBackend<T extends Workspaces = Workspaces> extends Backend<T> {
  constructor({
    cwd = process.cwd(),
    port = 4500,
    config,
    createStore,
    createDraftStore
  }: DevServerOptions<T>) {
    const dashboardUrl = `http://localhost:${port}`
    const outDir = path.join(cwd, '.alinea')
    const data = new FileData({
      config,
      fs,
      loader: JsonLoader,
      rootDir: cwd
    })
    const drafts = new DevDrafts({
      outDir,
      createStore: createDraftStore
    })
    super({
      dashboardUrl,
      createStore,
      config,
      drafts: drafts,
      media: data,
      target: data,
      previews: new JWTPreviews('@alinea/backend/devserver')
    })
  }
}

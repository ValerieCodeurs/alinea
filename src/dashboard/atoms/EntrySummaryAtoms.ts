import {Entry} from 'alinea/core/Entry'
import {summarySelection} from 'alinea/core/media/Summary'
import {createSelection} from 'alinea/core/pages/CreateSelection'
import {Cursor} from 'alinea/core/pages/Cursor'
import DataLoader from 'dataloader'
import {atom} from 'jotai'
import {atomFamily} from 'jotai/utils'
import {configAtom} from './DashboardAtoms.js'
import {entryRevisionAtoms, graphAtom} from './DbAtoms.js'

export interface EntrySummary {
  entryId: string
  i18nId: string
  type: string
  workspace: string
  root: string
  title: string
  parents: Array<{
    entryId: string
    i18nId: string
    title: string
  }>
  childrenAmount: number
}

export const entrySummaryLoaderAtom = atom(async get => {
  const {preferDraft: drafts} = await get(graphAtom)
  const {schema} = get(configAtom)
  const selection = summarySelection(schema)
  return new DataLoader(async (ids: ReadonlyArray<string>) => {
    const res = new Map()
    let cursor: Cursor.Find<any> = Entry().where(Entry.entryId.isIn(ids))
    cursor = new Cursor.Find<any>({
      ...cursor[Cursor.Data],
      select: createSelection(selection)
    })
    const entries: Array<EntrySummary> = await drafts.find(cursor)
    for (const entry of entries) res.set(entry.entryId, entry)
    return ids.map(id => res.get(id)) as typeof entries
  })
})

export const entrySummaryAtoms = atomFamily((id: string) => {
  return atom(async get => {
    const loader = await get(entrySummaryLoaderAtom)
    // We clear the dataloader cache because we use the atom family cache
    const summary = await loader.clear(id).load(id)
    if (!summary) return
    get(entryRevisionAtoms(summary.i18nId))
    if (summary?.parents)
      for (const parent of summary.parents)
        get(entryRevisionAtoms(parent.i18nId))
    return summary
  })
})

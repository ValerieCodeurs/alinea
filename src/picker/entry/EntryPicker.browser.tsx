import {Root, WorkspaceData, createId} from 'alinea/core'
import {Entry} from 'alinea/core/Entry'
import {Reference} from 'alinea/core/Reference'
import {isMediaRoot} from 'alinea/core/media/MediaRoot'
import {and} from 'alinea/core/pages/Expr'
import {entries} from 'alinea/core/util/Objects'
import {useFocusList} from 'alinea/dashboard/hook/UseFocusList'
import {useNav} from 'alinea/dashboard/hook/UseNav'
import {useRoot} from 'alinea/dashboard/hook/UseRoot'
import {useWorkspace} from 'alinea/dashboard/hook/UseWorkspace'
import {Breadcrumbs} from 'alinea/dashboard/view/Breadcrumbs'
import {IconButton} from 'alinea/dashboard/view/IconButton'
import {Modal} from 'alinea/dashboard/view/Modal'
import {
  Explorer,
  ExporerItemSelect
} from 'alinea/dashboard/view/explorer/Explorer'
import {FileUploader} from 'alinea/dashboard/view/media/FileUploader'
import {Picker, PickerProps} from 'alinea/editor/Picker'
import {
  Button,
  HStack,
  Loader,
  Stack,
  TextLabel,
  VStack,
  fromModule
} from 'alinea/ui'
import {IcOutlineGridView} from 'alinea/ui/icons/IcOutlineGridView'
import {IcOutlineList} from 'alinea/ui/icons/IcOutlineList'
import {IcRoundSearch} from 'alinea/ui/icons/IcRoundSearch'
import {Suspense, useCallback, useMemo, useState} from 'react'
import {
  EntryPickerOptions,
  entryPicker as createEntryPicker
} from './EntryPicker.js'
import css from './EntryPicker.module.scss'
import {EntryPickerRow} from './EntryPickerRow.js'
import {EntryReference} from './EntryReference.js'

export * from './EntryPicker.js'

export const entryPicker = Picker.withView(createEntryPicker, {
  view: EntryPickerModal,
  viewRow: EntryPickerRow
})

interface PickerLocation {
  parentId?: string
  workspace: string
  root: string
}

const styles = fromModule(css)

function mediaRoot(workspace: WorkspaceData & {name: string}): string {
  for (const [name, root] of entries(workspace.roots))
    if (isMediaRoot(root)) return name
  throw new Error(`Workspace ${workspace.name} has no media root`)
}

export interface EntryPickerModalProps
  extends PickerProps<EntryPickerOptions> {}

export function EntryPickerModal({
  type,
  options,
  selection,
  onConfirm,
  onCancel
}: EntryPickerModalProps) {
  const {title, defaultView, max, condition, showMedia} = options
  const [search, setSearch] = useState('')
  const list = useFocusList({
    onClear: () => setSearch('')
  })
  const [selected, setSelected] = useState<Array<Reference>>(
    () => selection || []
  )
  const workspace = useWorkspace()
  const {name: root} = useRoot()
  const [destination, setDestination] = useState<PickerLocation>({
    workspace: workspace.name,
    root: showMedia ? mediaRoot(workspace) : root
  })
  const cursor = useMemo(() => {
    const terms = search.replace(/,/g, ' ').split(' ').filter(Boolean)
    const rootCondition = and(
      Entry.workspace.is(destination.workspace),
      Entry.root.is(destination.root)
    )
    const destinationCondition =
      terms.length === 0
        ? and(rootCondition, Entry.parent.is(destination.parentId ?? null))
        : rootCondition
    return Entry()
      .where(
        condition ? condition.and(destinationCondition) : destinationCondition
      )
      .search(...terms)
  }, [destination, search, condition])
  const [view, setView] = useState<'row' | 'thumb'>(defaultView || 'row')
  const handleSelect = useCallback(
    (entry: ExporerItemSelect) => {
      setSelected(selected => {
        const index = selected.findIndex(
          ref =>
            EntryReference.isEntryReference(ref) && ref.entry === entry.entryId
        )
        let res = selected.slice()
        if (index === -1) {
          res = res
            .concat({
              id: createId(),
              type,
              entry: entry.entryId
            } as EntryReference)
            .slice(-(max || 0))
        } else {
          res.splice(index, 1)
          res = res.slice(-(max || 0))
        }
        // Special case: if we're expecting a single reference we'll confirm
        // upon selection
        if (max === 1 && res.length === 1) onConfirm(res)
        return res
      })
    },
    [setSelected, max]
  )
  function handleConfirm() {
    onConfirm(selected)
  }
  const nav = useNav()
  const parents = [
    {id: workspace.name, title: workspace.label},
    {id: destination.root, title: Root.label(workspace.roots[destination.root])}
  ]
  return (
    <Modal open onClose={onCancel} className={styles.root()}>
      <Suspense fallback={<Loader absolute />}>
        <div className={styles.root.header()}>
          <VStack gap={24}>
            <VStack gap={8}>
              <Breadcrumbs parents={parents} />
              <h2>
                {title ? <TextLabel label={title} /> : 'Select a reference'}
              </h2>
            </VStack>
            <label className={styles.root.search()}>
              <IcRoundSearch className={styles.root.search.icon()} />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={event => setSearch(event.target.value)}
                className={styles.root.search.input()}
                {...list.focusProps}
                autoFocus
              />
              <Stack.Right>
                <HStack gap={16}>
                  <IconButton
                    icon={IcOutlineList}
                    active={view === 'row'}
                    onClick={() => setView('row')}
                  />
                  <IconButton
                    icon={IcOutlineGridView}
                    active={view === 'thumb'}
                    onClick={() => setView('thumb')}
                  />
                </HStack>
              </Stack.Right>
            </label>
          </VStack>
        </div>
        <VStack style={{flexGrow: 1, minHeight: 0}}>
          <list.Container>
            <div className={styles.root.results()}>
              <Explorer
                virtualized
                cursor={cursor}
                type={view}
                selectable
                selection={selected}
                toggleSelect={handleSelect}
                onNavigate={entryId => {
                  setDestination({...destination, parentId: entryId})
                }}
              />
            </div>
          </list.Container>
          {showMedia && (
            <FileUploader
              destination={destination}
              max={max}
              toggleSelect={handleSelect}
            />
          )}
        </VStack>
        <HStack as="footer" className={styles.root.footer()}>
          <Stack.Right>
            <HStack gap={16}>
              <Button outline type="button" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm</Button>
            </HStack>
          </Stack.Right>
        </HStack>
      </Suspense>
    </Modal>
  )
}

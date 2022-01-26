import {Entry, EntryStatus} from '@alinea/core'
import {
  CurrentDraftProvider,
  EntryDraft,
  Fields,
  InputPath,
  useCurrentDraft,
  useInput
} from '@alinea/editor'
import {select, SelectInput} from '@alinea/input.select'
import {text, TextInput} from '@alinea/input.text'
import {
  AppBar,
  Chip,
  fromModule,
  HStack,
  Loader,
  Pane,
  px,
  Stack,
  Typo,
  useObservable
} from '@alinea/ui'
import {ComponentType, FormEvent, Suspense, useState} from 'react'
import {Helmet} from 'react-helmet'
import {
  MdArchive,
  MdCheck,
  MdEdit,
  MdPublish,
  MdRotateLeft
} from 'react-icons/md'
import {useQuery, useQueryClient} from 'react-query'
import {useHistory} from 'react-router'
import {Link} from 'react-router-dom'
import slug from 'simple-slugify'
import {useDashboard} from '../hook/UseDashboard'
import {useDraft} from '../hook/UseDraft'
import {useSession} from '../hook/UseSession'
import css from './EntryEdit.module.scss'

type EntryStatusChipProps = {
  status: EntryStatus
}

function EntryStatusChip({status}: EntryStatusChipProps) {
  switch (status) {
    case EntryStatus.Published:
      return <Chip icon={MdCheck}>Published</Chip>
    case EntryStatus.Draft:
      return <Chip icon={MdEdit}>Draft</Chip>
    case EntryStatus.Archived:
      return <Chip icon={MdArchive}>Archived</Chip>
  }
}

const styles = fromModule(css)

function EntryEditHeader() {
  const session = useSession()
  const draft = useCurrentDraft()
  const [status = EntryStatus.Published] = useInput(EntryDraft.$status)
  const [isPublishing, setPublishing] = useState(false)
  function handlePublish() {
    setPublishing(true)
    return session.hub.content.publish([draft.getEntry()]).finally(() => {
      setPublishing(false)
    })
  }
  return (
    <AppBar.Root>
      <AppBar.Item full style={{flexGrow: 1}}>
        <Typo.Monospace
          style={{
            display: 'block',
            width: '100%',
            background: 'var(--highlight)',
            padding: `${px(8)} ${px(15)}`,
            borderRadius: px(8)
          }}
        >
          {draft.$path}
        </Typo.Monospace>
      </AppBar.Item>
      <Stack.Right>
        <AppBar.Item>
          <EntryStatusChip status={status} />
        </AppBar.Item>
      </Stack.Right>
      {status !== EntryStatus.Published && !isPublishing && (
        <AppBar.Item as="button" icon={MdPublish} onClick={handlePublish}>
          Publish
        </AppBar.Item>
      )}
      {isPublishing && (
        <AppBar.Item as="button" icon={MdRotateLeft}>
          Publishing...
        </AppBar.Item>
      )}
      {/*<Tabs.Root defaultValue="type">
        <Tabs.List>
          <Tabs.Trigger value="type">
            {type?.label && <TextLabel label={type?.label} />}
          </Tabs.Trigger>
        </Tabs.List>
    </Tabs.Root>*/}
    </AppBar.Root>
  )
}

function EntryTitle() {
  const [title] = useInput(EntryDraft.title)
  return (
    <h1 style={{position: 'relative', zIndex: 1, paddingBottom: '10px'}}>
      {title}
      <Helmet>
        <title>{title}</title>
      </Helmet>
    </h1>
  )
}

type EntryPreviewProps = {
  draft: EntryDraft
  preview: ComponentType<Entry>
}

function EntryPreview({draft, preview: Preview}: EntryPreviewProps) {
  const entry = useObservable(draft.entry)
  return <Preview {...entry} />
}

type EntryEditDraftProps = {draft: EntryDraft}

function EntryEditDraft({draft}: EntryEditDraftProps) {
  const session = useSession()
  const type = session.hub.schema.type(draft.type)
  const {preview} = useDashboard()
  return (
    <HStack style={{height: '100%'}}>
      <div style={{flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
        <EntryEditHeader />
        <div className={styles.draft()}>
          <EntryTitle />

          <Suspense fallback={null}>
            {type ? <Fields type={type} /> : 'Channel not found'}
          </Suspense>
        </div>
      </div>
      {preview && (
        <Pane id="preview" resizable="left" defaultWidth={330} minWidth={320}>
          <div className={styles.draft.preview()}>
            <EntryPreview preview={preview} draft={draft} />
          </div>
        </Pane>
      )}
    </HStack>
  )
}

/*
type NewEntryEditProps = {typeKey: string}

function NewEntryEdit({typeKey}: NewEntryEditProps) {
  const {hub} = useSession()
  const type = hub.schema.type(typeKey)!
  const data = {
    entry: type.create(typeKey),
    draft: null
  }
  const draft = useDraft(type, data, doc => {
    return hub.content.putDraft(data.entry.id, doc)
  })
  if (!draft) return null
  return (
    <>
      <CurrentDraftProvider value={draft}>
        <EntryEditDraft />
      </CurrentDraftProvider>
    </>
  )
}
*/

export type NewEntryProps = {parent: string}

export function NewEntry({parent}: NewEntryProps) {
  const queryClient = useQueryClient()
  const history = useHistory()
  const {hub} = useSession()
  const {isLoading, data: parentEntry} = useQuery(
    ['entry', parent],
    () => hub.content.get(parent),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      suspense: true
    }
  )
  const type = hub.schema.type(parentEntry?.type)
  const types = type?.options.contains || hub.schema.keys
  const [selectedType, setSelectedType] = useState(
    types.length === 1 ? types[0] : undefined
  )
  const [title, setTitle] = useState('')
  const [isCreating, setCreating] = useState(false)
  function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!selectedType) return
    setCreating(true)
    const type = hub.schema.type(selectedType)!
    const path = slug.slugify(title)
    const entry = {
      ...type.create(selectedType),
      path,
      $parent: parentEntry?.id,
      $path: (parentEntry?.$path || '') + '/' + path
    }
    hub.content
      .put(entry.id, {...entry, title})
      .then(() => {
        if (entry.$parent)
          queryClient.invalidateQueries('children', entry.$parent)
        history.push(`/${entry.id}`)
      })
      .finally(() => {
        setCreating(false)
      })
  }
  return (
    <div className={styles.new()}>
      <form className={styles.new.modal()} onSubmit={handleCreate}>
        {isCreating ? (
          <Loader absolute />
        ) : (
          <>
            <TextInput
              path={new InputPath.StatePair(title, setTitle)}
              field={text('Title')}
            />
            <SelectInput
              path={new InputPath.StatePair(selectedType, setSelectedType)}
              field={select(
                'Select type',
                Object.fromEntries(
                  types.map(typeKey => {
                    const type = hub.schema.type(typeKey)
                    return [typeKey, type?.label || typeKey]
                  })
                )
              )}
            />
            <Link to={`/${parent}`}>Cancel</Link>
            <button>Create</button>
          </>
        )}
      </form>
    </div>
  )
}

export type EntryEditProps = {id: string}

export function EntryEdit({id}: EntryEditProps) {
  const draft = useDraft(id)
  if (!draft) return null
  return (
    <CurrentDraftProvider value={draft}>
      <EntryEditDraft key={draft.doc.guid} draft={draft} />
    </CurrentDraftProvider>
  )
}

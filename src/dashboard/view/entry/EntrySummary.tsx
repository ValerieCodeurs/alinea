import {
  Chip,
  Ellipsis,
  HStack,
  IconLink,
  TextLabel,
  Typo,
  VStack,
  fromModule
} from 'alinea/ui'
import {Entry, Tree, view} from 'alinea/core'

import {Collection} from 'alinea/store'
import {IcRoundKeyboardArrowRight} from 'alinea/ui/icons/IcRoundKeyboardArrowRight'
import {MdiLaunch} from 'alinea/ui/icons/MdiLaunch'
import {ReactNode} from 'react'
import css from './EntrySummary.module.scss'
import {useDashboard} from '../../hook/UseDashboard.js'
import {useNav} from '../../hook/UseNav.js'

const styles = fromModule(css)

function entrySummaryQuery(Entry: Collection<Entry>) {
  return {
    id: Entry.id,
    type: Entry.type,
    workspace: Entry.alinea.workspace,
    root: Entry.alinea.root,
    title: Entry.title,
    parents: Tree.parents(Entry.id).select(parent => ({title: parent.title}))
  }
}

export const EntrySummaryRow = view(
  entrySummaryQuery,
  function EntrySummaryRow({id, title, type: typeName, parents}) {
    const nav = useNav()
    const {schema} = useDashboard().config
    const type = schema.type(typeName)
    if (!type) return null
    return (
      <HStack center full gap={10} className={styles.row()}>
        <VStack>
          {parents.length > 0 && (
            <Ellipsis>
              <Typo.Small>
                <HStack center gap={3}>
                  {parents
                    .map<ReactNode>(({title}, i) => (
                      <TextLabel key={i} label={title} />
                    ))
                    .reduce((prev, curr, i) => [
                      prev,
                      <IcRoundKeyboardArrowRight key={`s${i}`} />,
                      curr
                    ])}
                </HStack>
              </Typo.Small>
            </Ellipsis>
          )}
          <Ellipsis>
            <TextLabel label={title} />
          </Ellipsis>
        </VStack>
        <IconLink
          style={{marginLeft: 'auto'}}
          icon={MdiLaunch}
          href={nav.entry({id})}
          target="_blank"
        />
        <Chip>
          <TextLabel label={type.label} />
        </Chip>
      </HStack>
    )
  }
)

export const EntrySummaryThumb = view(
  entrySummaryQuery,
  function EntrySummaryThumb({id, title, type: typeName, parents}) {
    const {schema} = useDashboard().config
    const type = schema.type(typeName)!
    return (
      <div className={styles.thumb()}>
        {parents.length > 0 && (
          <header className={styles.thumb.header()}>
            <Typo.Small>
              <HStack center gap={3}>
                {parents
                  .map<ReactNode>(({title}, i) => (
                    <TextLabel key={i} label={title} />
                  ))
                  .reduce((prev, curr, i) => [
                    prev,
                    <IcRoundKeyboardArrowRight key={`s${i}`} />,
                    curr
                  ])}
              </HStack>
            </Typo.Small>
          </header>
        )}
        <div className={styles.thumb.title()}>
          <TextLabel label={title} />
        </div>
        <div className={styles.thumb.footer()}>
          <Chip style={{marginLeft: 'auto'}}>
            <TextLabel label={type.label} />
          </Chip>
        </div>
      </div>
    )
  }
)

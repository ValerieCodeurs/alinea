import {Client} from '@alinea/client'
import {Session} from '@alinea/core'
import {
  FavIcon,
  Loader,
  Pane,
  Statusbar,
  useObservable,
  Viewport
} from '@alinea/ui'
import {Sidebar} from '@alinea/ui/Sidebar'
import {getRandomColor} from '@alinea/ui/util/GetRandomColor'
//import 'preact/debug'
import {Fragment, Suspense, useState} from 'react'
import {Helmet} from 'react-helmet'
import {
  MdCheck,
  MdEdit,
  MdInsertDriveFile,
  MdRotateLeft,
  MdSearch,
  MdWarning
} from 'react-icons/md'
import {QueryClient, QueryClientProvider} from 'react-query'
import {Route} from 'react-router'
import {HashRouter} from 'react-router-dom'
import {DashboardOptions} from './Dashboard'
import {DashboardProvider, useDashboard} from './hook/UseDashboard'
import {DraftsProvider, useDrafts} from './hook/UseDrafts'
import {SessionProvider} from './hook/UseSession'
import {ContentTree} from './view/ContentTree'
import {EntryEdit, NewEntry} from './view/EntryEdit'
import {Toolbar} from './view/Toolbar'

function AppAuthenticated() {
  const {name, color, auth} = useDashboard()
  return (
    <DraftsProvider>
      <Statusbar.Provider>
        <Helmet>
          <title>{name}</title>
        </Helmet>
        <Toolbar />
        <div
          style={{
            flex: '1',
            display: 'flex',
            minHeight: 0,
            position: 'relative'
          }}
        >
          <Sidebar.Root>
            <Sidebar.Menu>
              <Sidebar.Menu.Item selected>
                <MdInsertDriveFile />
              </Sidebar.Menu.Item>
              <Sidebar.Menu.Item>
                <MdSearch />
              </Sidebar.Menu.Item>
              <Sidebar.Menu.Item>
                <MdCheck />
              </Sidebar.Menu.Item>
            </Sidebar.Menu>
          </Sidebar.Root>
          <Route path="/:id">
            {({match}) => {
              const id = match?.params.id!
              return (
                <>
                  <Pane
                    id="content-tree"
                    resizable="right"
                    defaultWidth={330}
                    minWidth={200}
                  >
                    <ContentTree selected={id} />
                  </Pane>
                  <div style={{width: '100%'}}>
                    {id && (
                      <Suspense fallback={<Loader absolute />}>
                        <Route path="/:id/new">
                          <NewEntry parent={id} />
                        </Route>
                        <EntryEdit id={id} />
                      </Suspense>
                    )}
                  </div>
                </>
              )
            }}
          </Route>
        </div>
        <Statusbar.Root>
          <DraftsStatus />
          {!auth && (
            <Statusbar.Status icon={MdWarning}>
              Not using authentication
            </Statusbar.Status>
          )}
        </Statusbar.Root>
      </Statusbar.Provider>
    </DraftsProvider>
  )
}

function DraftsStatus() {
  const drafts = useDrafts()
  const status = useObservable(drafts.status)
  switch (status) {
    case 'synced':
      return <Statusbar.Status icon={MdCheck}>Synced</Statusbar.Status>
    case 'editing':
      return <Statusbar.Status icon={MdEdit}>Editing</Statusbar.Status>
    case 'saving':
      return <Statusbar.Status icon={MdRotateLeft}>Saving</Statusbar.Status>
  }
}

type AppRootProps = {
  session: Session | undefined
  setSession: (session: Session | undefined) => void
}

function AppRoot({session, setSession}: AppRootProps) {
  const {color, name, auth: Auth = Fragment} = useDashboard()
  const inner = session ? (
    <AppAuthenticated />
  ) : (
    <Auth setSession={setSession} />
  )
  return (
    <Viewport color={color}>
      <FavIcon color={color} />
      {inner}
    </Viewport>
  )
}

function localSession<T>(options: DashboardOptions<T>) {
  return {
    user: {sub: 'anonymous'},
    hub: new Client(options.schema, options.apiUrl),
    end: async () => {}
  }
}

export function App<T>(props: DashboardOptions<T>) {
  const [queryClient] = useState(() => new QueryClient())
  const [session, setSession] = useState<Session | undefined>(
    !props.auth ? localSession(props) : undefined
  )
  return (
    <DashboardProvider
      value={{...props, color: props.color || getRandomColor(props.name)}}
    >
      <HashRouter hashType="noslash">
        <SessionProvider value={session}>
          <QueryClientProvider client={queryClient}>
            <AppRoot session={session} setSession={setSession} />
          </QueryClientProvider>
        </SessionProvider>
      </HashRouter>
    </DashboardProvider>
  )
}

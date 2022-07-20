import {outcome, Workspace} from '@alinea/core'
import {usePreferences} from '@alinea/ui'
import {useMemo} from 'react'
import {useMatch} from 'react-router'
import {dashboardNav} from '../DashboardNav'
import {useDashboard} from './UseDashboard'

const nav = dashboardNav({})

export function useWorkspace(): Workspace {
  const {config} = useDashboard()
  const preferences = usePreferences()
  const [match] = outcome(() => useMatch(nav.matchWorkspace))
  return useMemo(() => {
    const params: Record<string, string | undefined> = match?.params ?? {}
    const keys = Object.keys(config.workspaces)
    const {
      workspace = keys.includes(preferences.workspace!)
        ? preferences.workspace!
        : keys[0]
    } = params
    return config.workspaces[workspace]
  }, [config, match])
}

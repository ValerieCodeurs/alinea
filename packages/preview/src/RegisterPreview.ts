export enum PreviewAction {
  Ping = '[alinea-ping]',
  Reload = '[alinea-reload]',
  Refetch = '[alinea-refetch]',
  Previous = '[alinea-previous]',
  Next = '[alinea-next]'
}

export type PreviewApi = {
  refetch?: () => void
}

export function registerPreview(api: PreviewApi = {}) {
  if (typeof window === 'undefined') return
  function handleMessage(event: MessageEvent<string>) {
    switch (event.data) {
      case PreviewAction.Reload:
        console.log('[Alinea preview reload received]')
        return location.reload()
      case PreviewAction.Refetch:
        console.log('[Alinea preview refetch received]')
        return api.refetch ? api.refetch() : location.reload()
      case PreviewAction.Previous:
        console.log('[Alinea preview previous received]')
        return history.back()
      case PreviewAction.Next:
        console.log('[Alinea preview next received]')
        return history.forward()
      case PreviewAction.Ping:
        console.log('[Alinea preview ping received]')
        return postMessage('pong', event.origin)
    }
  }
  addEventListener('message', handleMessage)
  console.log('[Alinea preview listener attached]')
  return () => {
    removeEventListener('message', handleMessage)
  }
}

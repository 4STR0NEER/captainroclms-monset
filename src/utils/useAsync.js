import { useEffect, useState } from 'react'

// Runs an async service call and tracks { data, loading, error }. Re-runs when deps change.
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    let live = true
    setState((s) => ({ ...s, loading: true }))
    fn().then(
      (data) => live && setState({ data, loading: false, error: null }),
      (error) => live && setState({ data: null, loading: false, error }),
    )
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

import { useState, useEffect } from 'react'

export function useStorage(key, initialValue) {
  const [state, setState] = useState(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        setState(parsed)
      } else {

        localStorage.setItem(key, JSON.stringify(initialValue))
        setState(initialValue)
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err)
      setError(err)
      setState(initialValue)
    } finally {
      setLoading(false)
    }
  }, [key])

  const setValue = (newValue) => {
    try {
      const valueToStore = typeof newValue === 'function' ? newValue(state) : newValue
      localStorage.setItem(key, JSON.stringify(valueToStore))
      setState(valueToStore)
      setError(null)
    } catch (err) {
      console.error('Ошибка при сохранении данных:', err)
      setError(err)
    }
  }

  return [state, setValue, { loading, error }]
}

export function useLocalStorage(key, initialValue) {
  return useStorage(key, initialValue)
}
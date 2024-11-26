'use client'

import { useState, useEffect, useCallback } from 'react'
import styles from './page.module.css'

export default function VowelLearner() {
  const [word, setWord] = useState('')
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [correctAttempts, setCorrectAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchWord = useCallback(async () => {
    setTransitioning(true)
    setError(null)
    setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/get-word')
        if (!response.ok) {
          throw new Error('Failed to fetch word')
        }
        const data = await response.json()
        setWord(data.word.toLowerCase())
      } catch (err) {
        setError('Failed to load word. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
        setTransitioning(false)
      }
    }, 500)
  }, [])

  useEffect(() => {
    fetchWord()
  }, [fetchWord])

  useEffect(() => {
    if (!loading && word) {
      const vowels = word.match(/[aeiou]/gi) || []
      let delay = 0
      vowels.forEach((vowel) => {
        setTimeout(() => {
          const audio = new Audio(`/${vowel.toUpperCase()}.mp3`)
          audio.play()
        }, delay)
        delay += 1000
      })
    }
  }, [word, loading])

  const handleAttempt = (isCorrect: boolean) => {
    setTotalAttempts(prev => prev + 1)
    if (isCorrect) {
      setCorrectAttempts(prev => prev + 1)
    }
    fetchWord()
  }

  const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Learn The F*cking Vowels</h1>
      <div className={styles.wordContainer}>
        {loading ? (
          <div className={styles.loading}></div>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <p className={`${styles.word} ${transitioning ? styles.exit : styles.enter}`}>{word}</p>
        )}
      </div>
      <div className={styles.buttonContainer}>
        <button 
          onClick={() => handleAttempt(true)} 
          className={`${styles.button} ${styles.successButton}`}
          disabled={loading || !!error}
        >
          Acierto
        </button>
        <button 
          onClick={() => handleAttempt(false)} 
          className={`${styles.button} ${styles.failButton}`}
          disabled={loading || !!error}
        >
          Fallo
        </button>
      </div>
      <p className={styles.successRate}>Porcentaje de aciertos: {successRate}%</p>
    </div>
  )
}


'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './page.module.css'

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

export default function VowelLearner() {
  const [word, setWord] = useState('')
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [correctAttempts, setCorrectAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [activeVowelIndex, setActiveVowelIndex] = useState<number | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const wordRef = useRef<HTMLParagraphElement>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    // Preload audio files
    let loadedCount = 0;
    VOWELS.forEach((vowel) => {
      const audio = new Audio(`/${vowel.toUpperCase()}.mp3`);
      audio.addEventListener('canplaythrough', () => {
        loadedCount++;
        if (loadedCount === VOWELS.length) {
          setAudioLoaded(true);
        }
      });
      audioRefs.current[vowel] = audio;
    });
  }, []);

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
    if (!loading && word && hasInteracted) {
      const vowels = word.match(/[aeiou]/gi) || []
      let delay = 0
      vowels.forEach((vowel, index) => {
        setTimeout(() => {
          const audio = audioRefs.current[vowel.toLowerCase()];
          if (audio) {
            audio.currentTime = 0; // Reset audio to start
            audio.play().catch((err) => {
              console.error('Audio playback failed:', err)
            })
          }

          // Delay para animar la vocal
          setTimeout(() => {
            setActiveVowelIndex(word.indexOf(vowel, index === 0 ? 0 : word.indexOf(vowels[index - 1]) + 1))
            setTimeout(() => setActiveVowelIndex(null), 900)
          }, 200) // Añadido un delay de 200ms
        }, delay)
        delay += 1000
      })
    }
  }, [word, loading, hasInteracted])

  const handleAttempt = (isCorrect: boolean) => {
    setTotalAttempts(prev => prev + 1)
    if (isCorrect) {
      setCorrectAttempts(prev => prev + 1)
    }
    fetchWord()
  }

  const successRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0

  if (!audioLoaded) {
    return (
      <div className={styles.container}>
  <div className={styles.spinner}>
    <span className={styles.text}>Loading...</span>
    <div className={styles.loading}></div>
  </div>
</div>
    )
  }

  return (
    <div className={styles.container}>
      {!hasInteracted ? (
        <div className={styles.interactionPrompt}>
          <button 
            onClick={() => setHasInteracted(true)} 
            className={styles.button}
          >
            Start Spelling the fucking V*wels
          </button>
        </div>
      ) : (
        <>
          <div className={styles.backgroundAnimation}></div>
          <h1 className={styles.title}>Learn The F*cking Vowels</h1>
          <div className={styles.wordContainer}>
            {loading ? (
              <div className={styles.loading}></div>
            ) : error ? (
              <p className={styles.error}>{error}</p>
            ) : (
              <p className={`${styles.word} ${transitioning ? styles.exit : styles.enter}`} ref={wordRef}>
                {word.split('').map((letter, index) => (
                  <span 
                    key={index} 
                    className={`${styles.vowel} ${index === activeVowelIndex ? styles.active : ''}`}
                    aria-live={index === activeVowelIndex ? "polite" : "off"}
                  >
                    {letter}
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className={styles.buttonContainer}>
            <button 
              onClick={() => handleAttempt(true)} 
              className={`${styles.button} ${styles.successButton}`}
              disabled={loading || !!error}
            >
              Success
            </button>
            <button 
              onClick={() => handleAttempt(false)} 
              className={`${styles.button} ${styles.failButton}`}
              disabled={loading || !!error}
            >
              Fail
            </button>
          </div>
          <p className={styles.successRate}>Percentage of hits: {successRate}%</p>
        </>
      )}
    </div>
  )
}


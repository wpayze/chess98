import { SOUNDS } from "@/constants/sounds"

type SoundKey = keyof typeof SOUNDS

const isClient = typeof window !== "undefined"
const soundCache: Partial<Record<SOUNDS, HTMLAudioElement>> = {}

if (isClient) {
  soundCache[SOUNDS.MOVE] = new Audio("/sound/move-self.mp3")
  soundCache[SOUNDS.CAPTURE] = new Audio("/sound/capture.mp3")
  soundCache[SOUNDS.CHECK] = new Audio("/sound/move-check.mp3")
  soundCache[SOUNDS.CASTLE] = new Audio("/sound/castle.mp3")
  soundCache[SOUNDS.ILLEGAL] = new Audio("/sound/illegal.mp3")
  soundCache[SOUNDS.GAME_START] = new Audio("/sound/game-start.mp3")
  soundCache[SOUNDS.GAME_END] = new Audio("/sound/game-end.mp3")
}

export const playSound = (sound: SOUNDS) => {
  if (!isClient) return

  try {
    const audio = soundCache[sound]
    if (!audio) {
      console.warn("Audio not found for sound key:", sound)
      return
    }

    audio.currentTime = 0
    audio.play().catch((e) => {
      console.warn("Unable to play sound (play error):", sound, e)
    })
  } catch (e) {
    console.warn("Error in playSound:", sound, e)
  }
}

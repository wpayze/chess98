import { SOUNDS } from "@/constants/sounds"

type SoundKey = keyof typeof SOUNDS

const soundCache: Record<SOUNDS, HTMLAudioElement> = {
  [SOUNDS.MOVE]: new Audio("/sound/move-self.mp3"),
  [SOUNDS.CAPTURE]: new Audio("/sound/capture.mp3"),
  [SOUNDS.CHECK]: new Audio("/sound/move-check.mp3"),
  [SOUNDS.CASTLE]: new Audio("/sound/castle.mp3"),
  [SOUNDS.ILLEGAL]: new Audio("/sound/illegal.mp3"),
  [SOUNDS.GAME_START]: new Audio("/sound/game-start.mp3"),
  [SOUNDS.GAME_END]: new Audio("/sound/game-end.mp3"),
}

export const playSound = (sound: SOUNDS) => {
  const audio = soundCache[sound]
  if (!audio) return

  audio.currentTime = 0
  audio.play().catch((e) => {
    console.warn("Unable to play sound:", sound, e)
  })
}

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (Ctor) ctx = new Ctor()
  }
  return ctx
}

export function ensureAudio(): Promise<void> {
  const c = getCtx()
  if (c && c.state === "suspended") return c.resume()
  return Promise.resolve()
}

export function beep(freq = 880, duration = 0.12, type: OscillatorType = "sine", when = 0, volume = 0.3): void {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t = c.currentTime + when
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t)
  osc.stop(t + duration)
}

export function startBeep(): void {
  beep(660, 0.15, "square")
}

export function endBeep(): void {
  beep(440, 0.2, "sine", 0)
  beep(660, 0.2, "sine", 0.18)
}

export function countdownBeep(secondsLeft: number): void {
  if (secondsLeft <= 3 && secondsLeft > 0) beep(880, 0.08)
}

export function speak(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.05
  utterance.volume = 1
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
}

export function stopSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
}

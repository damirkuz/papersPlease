type Sound = 'select' | 'call' | 'paper' | 'reveal' | 'water' | 'stamp' | 'award'
const level = 0.42
let bus: { context: AudioContext; master: GainNode } | undefined

function getBus() {
  if (!bus) {
    const context = new AudioContext()
    const master = context.createGain()
    master.gain.value = level
    master.connect(context.destination)
    bus = { context, master }
  }
  if (bus.context.state === 'suspended') void bus.context.resume().catch(() => {})
  return bus
}

export function setSoundMuted(muted: boolean) {
  try {
    const current = muted ? bus : getBus()
    if (!current) return
    const { context, master } = current
    const now = context.currentTime
    master.gain.cancelScheduledValues(now)
    master.gain.setTargetAtTime(muted ? 0 : level, now, 0.012)
  } catch {
    // Audio is optional, including in browsers without Web Audio support.
  }
}

export function playSound(kind: Sound) {
  try {
    const { context, master } = getBus()
    const now = context.currentTime

    function tone(delay: number, frequency: number, duration: number, gain: number, type: OscillatorType = 'sine') {
      const at = now + delay
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      oscillator.type = type
      oscillator.frequency.value = frequency
      envelope.gain.setValueAtTime(0.0001, at)
      envelope.gain.exponentialRampToValueAtTime(gain, at + 0.007)
      envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration)
      oscillator.connect(envelope).connect(master)
      oscillator.start(at)
      oscillator.stop(at + duration + 0.01)
      oscillator.onended = () => envelope.disconnect()
    }

    function texture(delay: number, duration: number, frequency: number, gain: number, type: BiquadFilterType) {
      const buffer = context.createBuffer(1, Math.ceil(duration * context.sampleRate), context.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) {
        const progress = i / data.length
        const tail = Math.exp(-progress * 5)
        data[i] = (Math.random() * 2 - 1) * tail * Math.min(1, progress * 60)
      }
      const noise = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const envelope = context.createGain()
      filter.type = type
      filter.frequency.value = frequency
      envelope.gain.value = gain
      noise.buffer = buffer
      noise.connect(filter).connect(envelope).connect(master)
      noise.onended = () => envelope.disconnect()
      noise.start(now + delay)
    }

    switch (kind) {
      case 'select':
        texture(0, 0.055, 1500, 0.17, 'bandpass')
        break
      case 'call':
        texture(0, 0.19, 270, 0.38, 'lowpass')
        tone(0.025, 523.25, 0.32, 0.14, 'triangle')
        tone(0.09, 783.99, 0.37, 0.08)
        break
      case 'paper':
        texture(0, 0.15, 1740, 0.27, 'bandpass')
        texture(0.067, 0.15, 970, 0.17, 'bandpass')
        break
      case 'reveal':
        texture(0, 0.085, 2600, 0.25, 'bandpass')
        tone(0.044, 370, 0.115, 0.06, 'triangle')
        texture(0.10, 0.12, 1360, 0.18, 'bandpass')
        break
      case 'water':
        texture(0, 0.40, 760, 0.23, 'bandpass')
        texture(0.08, 0.26, 1350, 0.16, 'bandpass')
        tone(0.08, 230, 0.20, 0.055)
        break
      case 'stamp':
        texture(0, 0.085, 1840, 0.24, 'bandpass')
        texture(0.014, 0.20, 350, 0.64, 'lowpass')
        tone(0.016, 115, 0.095, 0.24)
        texture(0.103, 0.085, 2200, 0.19, 'bandpass')
        break
      case 'award':
        for (const [index, note] of [392, 493.88, 587.33, 783.99].entries()) {
          tone(0.18 + index * 0.095, note, 0.53, 0.14, 'triangle')
        }
        break
    }
  } catch {
    // Audio failure should never interrupt the round.
  }
}

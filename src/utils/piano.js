// A tiny synth for playful key taps. Only ever starts from a user gesture, so browsers allow the audio.
let ctx

export const C_MAJOR = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25]

export function playNote(freq) {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)
  osc.connect(gain).connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 1.25)
}

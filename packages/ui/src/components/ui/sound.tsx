"use client"

import * as React from "react"

export type SoundCue =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "action"
  | "toast"
  | "button"
  | "default"

let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!sharedAudioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass()
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === "suspended") {
    sharedAudioContext.resume().catch(() => {})
  }
  return sharedAudioContext
}

export function playSound(cue: SoundCue | string) {
  const ctx = getAudioContext()
  if (!ctx || ctx.state !== "running") return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  switch (cue) {
    case "success": {
      // Pleasant rising chime: C5 (523Hz) -> E5 (659Hz)
      osc.type = "sine"
      osc.frequency.setValueAtTime(523.25, now)
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

      osc.start(now)
      osc.stop(now + 0.28)
      break
    }

    case "error": {
      // Low descending alert: 240Hz -> 180Hz
      osc.type = "triangle"
      osc.frequency.setValueAtTime(240, now)
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

      osc.start(now)
      osc.stop(now + 0.22)
      break
    }

    case "warning": {
      // Warm attention ping: 440Hz -> 494Hz
      osc.type = "sine"
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.setValueAtTime(493.88, now + 0.06)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.1, now + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

      osc.start(now)
      osc.stop(now + 0.2)
      break
    }

    case "info":
    case "action":
    case "toast-action":
    case "button": {
      // Crisp subtle tactile click
      osc.type = "triangle"
      osc.frequency.setValueAtTime(800, now)
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.08, now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

      osc.start(now)
      osc.stop(now + 0.05)
      break
    }

    case "toast":
    default: {
      // Gentle soft pop
      osc.type = "sine"
      osc.frequency.setValueAtTime(400, now)
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.06)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.06, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      osc.start(now)
      osc.stop(now + 0.14)
      break
    }
  }
}

/**
 * Global sound effects listener component.
 * Attaches a single listener on document to intercept interactive clicks/pointerdowns,
 * inspects `data-sound` and `data-slot` attributes, and triggers corresponding sound cues.
 */
export function SoundEffects() {
  React.useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      // Respect user interactions only (left click / primary touch)
      if (event.button !== 0 && event.pointerType === "mouse") return

      const target = event.target as Element | null
      if (!target) return

      const soundEl = target.closest("[data-sound], [data-slot]")
      if (!soundEl) return

      const sound = soundEl.getAttribute("data-sound")
      const slot = soundEl.getAttribute("data-slot")

      const cue = (sound || slot || "default") as SoundCue
      playSound(cue)
    }

    document.addEventListener("pointerdown", handlePointerDown, { passive: true })
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [])

  return null
}

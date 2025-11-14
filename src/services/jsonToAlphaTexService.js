  export function jsonToAlphaTex(songJson) {
    const lines = []

    // Handle array of objects - each becomes a separate track
    if (Array.isArray(songJson)) {
      // --- GLOBAL METADATA (before any tracks) ---
      const firstSong = songJson[0]
      if (firstSong) {
        lines.push(`\\title "${escapeQuotes(firstSong.name || 'Untitled')}"`)
        if (firstSong.subtitle) lines.push(`\\subtitle "${escapeQuotes(firstSong.subtitle)}"`)

        const firstTempo =
          firstSong.automations?.tempo?.[0] || firstSong.measures?.[0]?.voices?.[0]?.beats?.[0]?.tempo
        if (firstTempo?.bpm) lines.push(`\\tempo ${Number(firstTempo.bpm)}`)

        // Optional lyrics
        if (Array.isArray(firstSong.newLyrics)) {
          firstSong.newLyrics.forEach((lyric) => {
            if (lyric.text && lyric.text.trim()) {
              //   lines.push(`\\lyricline ${lyric.line} "${escapeQuotes(lyric.text)}"`)
            }
          })
        }
      }

      lines.push('.') // mandatory separator after global metadata

      // Add each track
      songJson.forEach((song, index) => {
        lines.push(convertSingleTrack(song, index))
      })

      return lines.join('\n')
    }

    // Handle single object - single track with metadata
    lines.push(`\\title "${escapeQuotes(songJson.name || 'Untitled')}"`)
    if (songJson.subtitle) lines.push(`\\subtitle "${escapeQuotes(songJson.subtitle)}"`)

    const firstTempo =
      songJson.automations?.tempo?.[0] || songJson.measures?.[0]?.voices?.[0]?.beats?.[0]?.tempo
    if (firstTempo?.bpm) lines.push(`\\tempo ${Number(firstTempo.bpm)}`)

    // Optional lyrics
    if (Array.isArray(songJson.newLyrics)) {
      songJson.newLyrics.forEach((lyric) => {
        if (lyric.text && lyric.text.trim()) {
          //    lines.push(`\\lyricline ${lyric.line} "${escapeQuotes(lyric.text)}"`)
        }
      })
    }

    lines.push('.') // mandatory separator
    lines.push(convertSingleTrack(songJson, 0))

    return lines.join('\n')
  }

  function convertSingleTrack(songJson, trackIndex) {
    if (!songJson || !Array.isArray(songJson.measures)) {
      throw new Error('Invalid song JSON')
    }
    console.log('Converting track JSON:', songJson)

    const durationMap = {
      1: '1',
      2: '2',
      4: '4',
      8: '8',
      16: '16',
      32: '32',
      64: '64',
    }

    const lines = []

    // --- TRACK DECLARATION ---
    const trackName = songJson.name || `Track ${trackIndex + 1}`
    lines.push(`\\track "${escapeQuotes(trackName)}"`)

    // --- STAFF DECLARATION ---
    lines.push(`  \\staff {score tabs}`)

    // --- TRACK-SPECIFIC SETTINGS (indented) ---
    if (songJson.instrument) {
      lines.push(`\\instrument "Distortion Guitar"`)
    }

    if (Array.isArray(songJson.tuning) && songJson.tuning.length) {
      const tuningNames = songJson.tuning.map(midiToNoteName)
      const tune = tuningNames.join(' ').trim()
      lines.push(`  \\tuning ${tune}`)
    }

    if (Number.isFinite(songJson.capo) && songJson.capo > 0) {
      lines.push(`  \\capo ${songJson.capo}`)
    }

    // --- CONTENT (indented) ---
    for (const measure of songJson.measures) {
      if (!measure.voices?.length) continue
      const voice = measure.voices[0]
      if (!Array.isArray(voice.beats)) continue

      const tokens = []

      for (const beat of voice.beats) {
        const dur = durationMap[beat.type] || '4'
        const notes = Array.isArray(beat.notes) ? beat.notes : []

        // --- Handle explicit rests ---
        if (beat.rest || (notes.length && notes.every((n) => n.rest))) {
          tokens.push(`r.${dur}`)
          continue
        }

        if (!notes.length) {
          tokens.push(`r.${dur}`)
          continue
        }

        const beatIsDotted = !!beat.dots || !!beat.dotted

        const noteTokens = notes
          .map((n) => {
            if (n.rest) return null // skip rests safely
            if (n.fret == null || n.string == null) return null
            const fret = n.fret
            // Round string to nearest integer and ensure it's valid (1-based)
            const string = Math.max(1, Math.round(n.string + 1))

            const effects = []

            // Handle bend effect with proper syntax
            if (n.bend) {
              // Bend needs specific format: {b (value1 value2)}
              // Extract bend points if available
              if (n.bend.points && Array.isArray(n.bend.points) && n.bend.points.length > 0) {
                const bendValues = n.bend.points.map((p) => p.value || 0).join(' ')
                effects.push(`b (${bendValues})`)
              } else if (n.bend.value !== undefined) {
                // Simple bend with single value
                effects.push(`b (0 ${n.bend.value})`)
              } else {
                // Default bend
                effects.push(`b (0 4)`)
              }
            }

            // Other effects (added separately, not combined with bend)
            if (n.vibrato || beat.vibrato) effects.push('v')
            if (n.dead) effects.push('x')
            if (n.palmMute) effects.push('pm')
            if (n.hp) effects.push('h')
            if (n.pu) effects.push('p')
            if (n.slide === 'downwards') effects.push('sod')
            if (n.slide === 'upwards') effects.push('sou')
            if (n.slide === 'shift') effects.push('ss')
            if (n.slide === 'legato') effects.push('sl')
            if (n.slide === 'below') effects.push('sib')
            if (n.slide === 'above') effects.push('sia')
            if (beatIsDotted) effects.push('d')
            if (beat.tuplet !== undefined) effects.push(`tu ${beat.tuplet}`)

            const effectStr = effects.length ? `{${effects.join(' ')}}` : ''
            return `${fret}.${string}${effectStr}`
          })
          .filter(Boolean)

        if (!noteTokens.length) continue

        if (noteTokens.length > 1) {
          tokens.push(`(${noteTokens.join(' ')})${'.'}${dur}`)
        } else {
          tokens.push(`${noteTokens[0]}.${dur}`)
        }
      }

      if (tokens.length) {
        lines.push(`  ${tokens.join(' ')} |`)
      } else {
        lines.push(`  r.4 |`)
      }
    }

    return lines.join('\n')
  }

  function escapeQuotes(s) {
    return String(s).replace(/"/g, '\\"')
  }

  function midiToNoteName(midi) {
    const notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']
    const note = notes[midi % 12]
    const octave = Math.floor(midi / 12) - 1
    return note + octave
  }

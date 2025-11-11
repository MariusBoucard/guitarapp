// alphaTabTexService.js

/**
 * Convert internal song JSON to AlphaTex (strict per docs)
 * - Uses `fret.string.duration` notation for single notes
 * - Uses `(f.s f.s).duration` for chords
 * - Effects appended as `{...}` after fret.string and BEFORE the `.duration`
 * - Dotted notes: extra '.' appended after the duration token -> `...duration.`
 * - Ensures metadata section has no leading blank line and the single '.' line
 *
 * @param {Object} songJson
 * @returns {string} alphaTex string (trimmed)
 */
export function jsonToAlphaTex(songJson) {
  if (!songJson || !Array.isArray(songJson.measures)) {
    throw new Error("Invalid song JSON (no measures)");
  }

  // Duration map (maps beat.type to AlphaTex numeric duration)
  const durationMap = {
    1: "1",
    2: "2",
    4: "4",
    8: "8",
    16: "16",
    32: "32",
    64: "64"
  };

  const lines = [];

  // --- METADATA (strict: no blank lines before metadata) ---
//  lines.push(`\\title "${escapeQuotes(songJson.name || "Untitled")}"`);

  if (songJson.instrument) {
 //   lines.push(`\\instrument "${escapeQuotes(songJson.instrument)}"`);
  }

  // tempo: prefer automations[0] then first beat tempo
  const firstTempo = (songJson.automations?.tempo && songJson.automations.tempo[0]) ||
                     (songJson.measures?.[0]?.voices?.[0]?.beats?.[0]?.tempo);
  if (firstTempo?.bpm) {
   // lines.push(`\\tempo ${Number(firstTempo.bpm)}`);
  }

  // time signature if present (first measure)
  const sig = songJson.measures?.[0]?.signature;
  if (Array.isArray(sig) && sig.length === 2) {
 //   lines.push(`\\ts ${Number(sig[0])} ${Number(sig[1])}`);
  }

  // capo
  if (Number.isFinite(songJson.capo) && songJson.capo > 0) {
   // lines.push(`\\capo ${Number(songJson.capo)}`);
  }

  // The mandatory single-dot line separating metadata from contents
 // lines.push(".");

  // --- CONTENTS: each measure -> line ending with '|' ---
  for (const measure of songJson.measures) {
    if (!measure || !Array.isArray(measure.voices) || measure.voices.length === 0) {
      continue;
    }

    // For now we render only the first voice (you can extend to multiple voices with \voice)
    const voice = measure.voices[0];
    if (!Array.isArray(voice.beats)) continue;

    const tokens = [];

    for (const beat of voice.beats) {
      var dur = durationMap[beat.type] || "4";
      const dotted = beat.dotted ? "{d}" : "";
      // If beat has no notes -> rest
      const notes = Array.isArray(beat.notes) ? beat.notes : [];
      if (notes.length === 0) {
        tokens.push(`r.${dur}`);
        continue;
      }

      // Build note representations. For chords we will join these without the .duration inside
      // For single notes we append `.duration` after each note token (per docs: f.s.d)
      const noteTokens = notes.map(n => {
        // Validate string/fret
        if (n.string == null || n.fret == null) return null;
        // Convert string index (assume incoming 0-based) -> alphaTex 1-based string numbering
        const stringNum = Number(n.string) + 1;
        const fretNum = Number(n.fret);
        // Collect effects (tie, hp/h, p etc). Use docs' pattern: {effect1 effect2}
        const effectList = [];
        if (n.tie) effectList.push("h");
        if (n.hp) effectList.push("h");
        if (n.pu) effectList.push("p"); // if your JSON uses 'pu' for pull-off, adapt
        // include any other custom flags as needed (e.g. bend, slide...) by mapping them here

        const effectsStr = effectList.length ? `{${effectList.join(" ")}}` : "";
        // For single-note formatting we include the duration after the note (outside effects).
        // For chords we'll omit the duration here and set it at the chord level.
        return `${fretNum}.${stringNum}${effectsStr}`;
      }).filter(Boolean);

      if (noteTokens.length === 0) continue;

      if (noteTokens.length > 1) {
        // chord: (note note ...).duration[.]
        tokens.push(`(${noteTokens.join(" ")})${"."}${dur}`.replace("..", "."));
        // Explanation: we need final form ( ... ).duration  but docs show ( ... ).4
        // We build e.g. "(0.3 3.4).4" -> our building string ensures the dot placement is correct.
        // The replace protects accidental double dots
      } else {
        // single note: full form is fret.string.duration[.]
        // noteTokens[0] is e.g. "3.2{h}" -> append ".<duration><dotted>"
        tokens.push(`${noteTokens[0]}${dotted}.${dur}`);
      }
    }

    // join tokens by single space and append barline
    if (tokens.length > 0) {
      lines.push(tokens.join(" ") + " |");
    } else {
      // If measure empty, add an empty bar
      lines.push("r.4 |");
    }
  }

  // Join lines, trim to remove any stray leading/trailing newline
  return lines.join("\n").trim();
}

/**
 * Escape double quotes inside metadata strings
 */
function escapeQuotes(s) {
  return String(s).replace(/"/g, '\\"');
}

/**
 * Small wrapper to validate and return result or error message
 */
export function validateAndConvert(songJson) {
  try {
    const alphaTex = jsonToAlphaTex(songJson);
    return { success: true, alphaTex };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

export function jsonToAlphaTex(songJson) {
  if (!songJson || !Array.isArray(songJson.measures)) {
    throw new Error("Invalid song JSON");
  }

  const durationMap = {
    1: "1", 2: "2", 4: "4", 8: "8", 16: "16", 32: "32", 64: "64"
  };

  const lines = [];

  // --- METADATA ---
  lines.push(`\\title "${escapeQuotes(songJson.name || "Untitled")}"`);
  if (songJson.instrument) lines.push(`\\instrument "${escapeQuotes(songJson.instrument)}"`);
  
  const firstTempo = (songJson.automations?.tempo?.[0]) ||
                     (songJson.measures?.[0]?.voices?.[0]?.beats?.[0]?.tempo);
  if (firstTempo?.bpm) lines.push(`\\tempo ${Number(firstTempo.bpm)}`);
  
  lines.push("."); // mandatory separator

  // --- CONTENT ---
  for (const measure of songJson.measures) {
    if (!measure.voices?.length) continue;
    const voice = measure.voices[0];
    if (!Array.isArray(voice.beats)) continue;

    const tokens = [];

    for (const beat of voice.beats) {
      const dur = durationMap[beat.type] || "4";

      const notes = Array.isArray(beat.notes) ? beat.notes : [];
      if (!notes.length) {
        tokens.push(`r.${dur}`);
        continue;
      }

      const beatIsDotted = !!beat.dots || !!beat.dotted;

      const noteTokens = notes.map(n => {
        if (n.fret == null || n.string == null) return null;
        const fret = n.fret;
        const string = n.string + 1; // 1-based
        const effects = [];

        if (n.vibrato || beat.vibrato) effects.push("v");
        if (n.hp) effects.push("h");
        if (n.pu) effects.push("p");
        if (n.tie) effects.push("tie");
        if (n.bend) effects.push("b");
        if (n.slide) effects.push("sl");
        if (beatIsDotted) effects.push("d");

        const effectStr = effects.length ? `{${effects.join(" ")}}` : "";
        return `${fret}.${string}${effectStr}`;
      }).filter(Boolean);

      if (!noteTokens.length) continue;

      if (noteTokens.length > 1) {
        // chord: duration outside parentheses
        tokens.push(`(${noteTokens.join(" ")})${"."}${dur}`);
      } else {
        tokens.push(`${noteTokens[0]}.${dur}`);
      }
    }

    if (tokens.length) lines.push(tokens.join(" ") + " |");
    else lines.push(`r.4 |`);
  }

  return lines.join("\n").trim();
}

function escapeQuotes(s) {
  return String(s).replace(/"/g, '\\"');
}

/** Format seconds as m:ss (or h:mm:ss past an hour). */
function fmtTime(seconds) {
	if (!isFinite(seconds) || seconds < 0) seconds = 0
	const s = Math.floor(seconds % 60)
	const m = Math.floor((seconds / 60) % 60)
	const h = Math.floor(seconds / 3600)
	const pad = (n) => String(n).padStart(2, '0')
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

function getVariableDefinitions() {
	return [
		{ variableId: 'current_clip', name: 'Current clip name' },
		{ variableId: 'current_time', name: 'Playback position (m:ss)' },
		{ variableId: 'duration', name: 'Clip duration (m:ss)' },
		{ variableId: 'time_remaining', name: 'Time remaining (m:ss)' },
		{ variableId: 'master_db', name: 'Master volume (dB)' },
		{ variableId: 'black', name: 'Black active (yes/no)' },
		{ variableId: 'clip_count', name: 'Number of clips on the board' },
	]
}

/** Derive variable values from a snapshot and/or a transport tick. */
function variableValues(state) {
	const values = {}
	if (!state) return values

	// Primary live clip name: prefer media layer, else the first live layer.
	let name = ''
	if (state.layers) {
		const order = ['media', 'overlay', 'background', 'audio']
		for (const k of order) {
			const l = state.layers[k]
			if (l && l.name) {
				name = l.name
				break
			}
		}
	}
	values.current_clip = name

	const t = state.transport
	const cur = t ? t.currentTime : 0
	const dur = t ? t.duration : 0
	values.current_time = fmtTime(cur)
	values.duration = fmtTime(dur)
	values.time_remaining = fmtTime(Math.max(0, dur - cur))

	if (typeof state.masterVolumeDB === 'number') {
		values.master_db = state.masterVolumeDB.toFixed(1)
	}
	values.black = state.black ? 'yes' : 'no'
	if (Array.isArray(state.clips)) values.clip_count = state.clips.length

	return values
}

module.exports = { getVariableDefinitions, variableValues }

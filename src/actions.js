/**
 * Build clip dropdown choices from the latest snapshot. Labelled
 * "Playlist / Clip" so duplicates across playlists are distinguishable.
 * allowCustom lets a button reference a clip id even before the first snapshot.
 */
function clipChoices(state) {
	const clips = (state && state.clips) || []
	return clips.map((c) => ({
		id: c.id,
		label: c.playlist ? `${c.playlist} / ${c.name}` : c.name,
	}))
}

function getActions(self) {
	const send = (path) => self.client.send(path)

	const toggleOptions = [
		{ id: 'toggle', label: 'Toggle' },
		{ id: 'on', label: 'On' },
		{ id: 'off', label: 'Off' },
	]

	return {
		trigger_clip: {
			name: 'Trigger / clear clip (toggle, by name)',
			description:
				'Takes the clip live. Pressing it again while the clip is already live clears it — so a single button toggles the clip on and off. Pair with the "Clip is live" feedback for a button that lights while it is on air.',
			options: [
				{
					type: 'dropdown',
					id: 'clip',
					label: 'Clip',
					default: '',
					choices: clipChoices(self.state),
					allowCustom: true,
				},
			],
			callback: async (event) => {
				const id = event.options.clip
				if (id) await send(`/api/trigger/id/${encodeURIComponent(id)}`)
			},
		},

		trigger_index: {
			name: 'Trigger / clear clip (toggle, by board position)',
			description:
				'Same toggle behaviour as "by name", but selects the clip by its position in board order (1-based) instead of from a dropdown.',
			options: [{ type: 'number', id: 'index', label: 'Position (1-based)', default: 1, min: 1, max: 999 }],
			callback: async (event) => {
				await send(`/api/trigger/index/${Math.max(1, Math.round(event.options.index))}`)
			},
		},

		play_pause: {
			name: 'Play / Pause',
			options: [],
			callback: async () => send('/api/transport/toggle'),
		},
		play: { name: 'Play', options: [], callback: async () => send('/api/transport/play') },
		pause: { name: 'Pause', options: [], callback: async () => send('/api/transport/pause') },
		restart: { name: 'Restart clip', options: [], callback: async () => send('/api/transport/restart') },

		seek: {
			name: 'Seek (relative)',
			options: [{ type: 'number', id: 'by', label: 'Seconds (+/-)', default: 5, min: -3600, max: 3600 }],
			callback: async (event) => send(`/api/transport/seek?by=${event.options.by}`),
		},

		next_clip: { name: 'Next clip', options: [], callback: async () => send('/api/clip/next') },
		prev_clip: { name: 'Previous clip', options: [], callback: async () => send('/api/clip/prev') },

		black: {
			name: 'Black',
			options: [{ type: 'dropdown', id: 'op', label: 'Action', default: 'toggle', choices: toggleOptions }],
			callback: async (event) => send(`/api/black/${event.options.op}`),
		},

		clear_layer: {
			name: 'Clear layer',
			options: [
				{
					type: 'dropdown',
					id: 'layer',
					label: 'Layer',
					default: 'all',
					choices: [
						{ id: 'all', label: 'All layers' },
						{ id: 'media', label: 'Media' },
						{ id: 'overlay', label: 'Overlay' },
						{ id: 'background', label: 'Background' },
						{ id: 'audio', label: 'Audio' },
					],
				},
			],
			callback: async (event) => send(`/api/clear/${event.options.layer}`),
		},

		volume_step: {
			name: 'Master volume nudge (±3 dB)',
			options: [
				{
					type: 'dropdown',
					id: 'by',
					label: 'Direction',
					default: '1',
					choices: [
						{ id: '1', label: 'Up' },
						{ id: '-1', label: 'Down' },
					],
				},
			],
			callback: async (event) => send(`/api/volume/step?by=${event.options.by}`),
		},

		volume_set: {
			name: 'Master volume set (dB)',
			options: [{ type: 'number', id: 'db', label: 'dB', default: 0, min: -60, max: 6 }],
			callback: async (event) => send(`/api/volume/set?db=${event.options.db}`),
		},

		mute: {
			name: 'Mute',
			options: [{ type: 'dropdown', id: 'op', label: 'Action', default: 'toggle', choices: toggleOptions }],
			callback: async (event) => send(`/api/mute/${event.options.op}`),
		},
	}
}

module.exports = { getActions, clipChoices }

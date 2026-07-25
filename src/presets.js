const { combineRgb } = require('@companion-module/base')

const WHITE = combineRgb(255, 255, 255)
const BLACK = combineRgb(0, 0, 0)
const DARK = combineRgb(20, 20, 20)
const GREY = combineRgb(40, 40, 40)

/** Ready-made buttons the operator can drag straight onto a page. */
function getPresets() {
	const base = (text, bg) => ({
		type: 'button',
		category: 'Program',
		name: text,
		style: { text, size: '14', color: WHITE, bgcolor: bg },
		steps: [],
		feedbacks: [],
	})

	const presets = {}

	presets.take_black = {
		...base('BLACK', DARK),
		steps: [{ down: [{ actionId: 'black', options: { op: 'toggle' } }], up: [] }],
		feedbacks: [{ feedbackId: 'black_active', options: {}, style: { bgcolor: BLACK, color: WHITE } }],
	}

	presets.play_pause = {
		...base('PLAY\\nPAUSE', GREY),
		steps: [{ down: [{ actionId: 'play_pause', options: {} }], up: [] }],
		feedbacks: [{ feedbackId: 'playing', options: {}, style: { bgcolor: combineRgb(0, 140, 0), color: WHITE } }],
	}

	presets.clear_all = {
		...base('CLEAR\\nALL', GREY),
		steps: [{ down: [{ actionId: 'clear_layer', options: { layer: 'all' } }], up: [] }],
		feedbacks: [],
	}

	presets.next_clip = {
		...base('NEXT', GREY),
		steps: [{ down: [{ actionId: 'next_clip', options: {} }], up: [] }],
		feedbacks: [],
	}

	presets.prev_clip = {
		...base('PREV', GREY),
		steps: [{ down: [{ actionId: 'prev_clip', options: {} }], up: [] }],
		feedbacks: [],
	}

	presets.mute = {
		...base('MUTE', GREY),
		steps: [{ down: [{ actionId: 'mute', options: { op: 'toggle' } }], up: [] }],
		feedbacks: [{ feedbackId: 'muted', options: {}, style: { bgcolor: combineRgb(180, 120, 0), color: WHITE } }],
	}

	// A template "trigger clip" button, pre-wired with live tally. The operator
	// picks the clip after dropping it (the custom option is left blank).
	presets.trigger_clip = {
		type: 'button',
		category: 'Clips',
		name: 'Toggle clip (trigger / clear, tally included)',
		style: { text: 'CLIP', size: '14', color: WHITE, bgcolor: GREY },
		steps: [{ down: [{ actionId: 'trigger_clip', options: { clip: '' } }], up: [] }],
		feedbacks: [
			{ feedbackId: 'clip_live', options: { clip: '' }, style: { bgcolor: combineRgb(200, 30, 30), color: WHITE } },
		],
	}

	return presets
}

module.exports = { getPresets }

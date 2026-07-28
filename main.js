const { InstanceBase, runEntrypoint, InstanceStatus } = require('@companion-module/base')
const { getConfigFields } = require('./src/config')
const { TcastClient } = require('./src/client')
const { getActions } = require('./src/actions')
const { getFeedbacks } = require('./src/feedbacks')
const { getVariableDefinitions, variableValues } = require('./src/variables')
const { getPresets } = require('./src/presets')

class TcastInstance extends InstanceBase {
	async init(config) {
		this.config = config
		/** Latest feedback snapshot pushed by TCast (null until connected). */
		this.state = null

		this.setVariableDefinitions(getVariableDefinitions())
		this.setPresetDefinitions(getPresets())
		this.rebuildDefinitions()

		this.client = new TcastClient(this)
		this.client.start()
	}

	async destroy() {
		if (this.client) this.client.stop()
	}

	async configUpdated(config) {
		this.config = config
		if (this.client) {
			this.client.stop()
			this.client.start()
		}
	}

	getConfigFields() {
		return getConfigFields()
	}

	/**
	 * Re-register actions and feedbacks so their clip dropdowns reflect the
	 * current board. Called on every snapshot because clips can be added,
	 * renamed, or reordered in the app at any time.
	 */
	rebuildDefinitions() {
		this.setActionDefinitions(getActions(this))
		this.setFeedbackDefinitions(getFeedbacks(this))
	}

	/** Handle a decoded WebSocket message from the control server. */
	onMessage(msg) {
		if (!msg || typeof msg !== 'object') return
		if (msg.type === 'state') {
			const prevCount = this.state && this.state.clips ? this.state.clips.length : -1
			const prevClipIds = this.clipSignature(this.state)
			this.state = msg
			// Only rebuild dropdowns when the clip set actually changed.
			// Avoids churn on every play/pause tally update.
			const newSig = this.clipSignature(msg)
			if (newSig !== prevClipIds || (msg.clips && msg.clips.length !== prevCount)) {
				this.rebuildDefinitions()
			}
			this.setVariableValues(variableValues(this.state))
			this.checkFeedbacks()
			this.updateStatus(InstanceStatus.Ok)
		} else if (msg.type === 'transport') {
			// Merge the tick into the cached snapshot for the time variables.
			if (this.state) this.state.transport = { ...this.state.transport, ...msg }
			this.setVariableValues(variableValues(this.state))
		}
	}

	/** A cheap signature of the clip list (id + name) to detect real changes. */
	clipSignature(state) {
		if (!state || !Array.isArray(state.clips)) return ''
		return state.clips.map((c) => `${c.id}:${c.name}`).join('|')
	}
}

runEntrypoint(TcastInstance, [])

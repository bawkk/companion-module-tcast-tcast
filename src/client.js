const WebSocket = require('ws')
const { InstanceStatus } = require('@companion-module/base')

/**
 * Talks to a TCast control server: fires action commands over HTTP and
 * keeps a WebSocket open for live feedback (the snapshot pushed on every state
 * change). Reconnects with backoff so a Companion button press works the moment
 * TCast comes back.
 */
class TcastClient {
	constructor(instance) {
		this.instance = instance
		this.ws = null
		this.reconnectTimer = null
		this.shouldRun = false
		this.backoff = 1000
	}

	get base() {
		const { host, port } = this.instance.config
		return `http://${host}:${port}`
	}

	get wsUrl() {
		const { host, port } = this.instance.config
		return `ws://${host}:${port}/`
	}

	/** Auth header when a control password is configured in TCast; empty otherwise. */
	get authHeaders() {
		const pw = (this.instance.config.password || '').trim()
		return pw ? { 'X-Control-Password': pw } : {}
	}

	start() {
		this.shouldRun = true
		this.connect()
	}

	stop() {
		this.shouldRun = false
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
		if (this.ws) {
			try {
				this.ws.removeAllListeners()
				this.ws.close()
			} catch (_e) {
				// already closing
			}
			this.ws = null
		}
	}

	connect() {
		if (!this.shouldRun) return
		const { host, port } = this.instance.config
		if (!host || !port) {
			this.instance.updateStatus(InstanceStatus.BadConfig, 'Set host and port')
			return
		}
		this.instance.updateStatus(InstanceStatus.Connecting)

		let ws
		try {
			ws = new WebSocket(this.wsUrl, { headers: this.authHeaders })
		} catch (e) {
			this.scheduleReconnect()
			return
		}
		this.ws = ws

		ws.on('open', () => {
			this.backoff = 1000
			this.instance.updateStatus(InstanceStatus.Ok)
			try {
				ws.send(JSON.stringify({ type: 'hello', role: 'companion' }))
			} catch (_e) {
				// snapshot is sent on connect anyway
			}
		})

		ws.on('message', (data) => {
			let msg
			try {
				msg = JSON.parse(data.toString())
			} catch (_e) {
				return
			}
			this.instance.onMessage(msg)
		})

		ws.on('close', () => {
			if (this.ws === ws) this.ws = null
			this.scheduleReconnect()
		})

		ws.on('error', () => {
			// 'close' fires next and handles the reconnect.
			this.instance.updateStatus(InstanceStatus.ConnectionFailure)
		})
	}

	scheduleReconnect() {
		if (!this.shouldRun || this.reconnectTimer) return
		this.instance.updateStatus(InstanceStatus.Disconnected)
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null
			this.connect()
		}, this.backoff)
		this.backoff = Math.min(this.backoff * 2, 10000)
	}

	/** Fire an action path (e.g. "/api/black/toggle"). Fire-and-forget. */
	async send(path) {
		const url = this.base + path
		try {
			const res = await fetch(url, { method: 'POST', headers: this.authHeaders })
			if (!res.ok) {
				this.instance.log('warn', `${path} -> HTTP ${res.status}`)
			}
		} catch (e) {
			this.instance.log('error', `Request to ${url} failed: ${e.message}`)
		}
	}
}

module.exports = { TcastClient }

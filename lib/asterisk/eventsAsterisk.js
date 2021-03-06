import ioSockets from './../util/ioSockets'
import EventsCalls from './eventsCalls'
import DetailDashboard from '.././detailDashboard'
import DetailCallsWaiting from '.././detailCallsWaiting'

const ioSocket = new ioSockets()
const eventsCalls = new EventsCalls()
const detailDashboard = new DetailDashboard()
const detailCallsWaiting = new DetailCallsWaiting()

class EventsAsterisk {
	/**
	 * Controlar los mensajes de error
	 */
	handlerError (msj, err) {
		console.error(`EventsASterisk ---> ${msj} : ${err}`)
	}

	queueMemberPause (data) {
		/*let agentStatus = ''
		if (data.Interface !== '') agentStatus = data.Paused

		detailDashboard.memberPause(data).then(data => {
			data.agent_status = agentStatus
			ioSocket.sendEmitDashboard('UpdateOther', data)
			ioSocket.sendSocketsExtras(data, false, false)
		}).catch(err => this.handlerError('Error pausing agent on the dashboard', err))*/
	}

	queueMemberAdd (data) {
		detailDashboard.memberAdd(data)
			.then(data => ioSocket.sendEmitFrontPanel(data))
			.catch(err => this.handlerError('Error adding agent on the dashboard', err))
	}

	newstate (data) {
		detailDashboard.ringAnswerOutbound(data)
			.then(data => eventsCalls.callsOutbound(data))
			.catch(err => this.handlerError('Error al mostrar Ring o Answer de Llamada Outbound', err))
	}

	newConnectedLine (data) {
		detailDashboard.ringInbound(data)
			.then(data => eventsCalls.callsInbound(data, 'eventNewConnectedLine'))
			.catch(err => this.handlerError('Error al mostrar ring de entrante', err))
	}

	agentConnect (data) {
		detailDashboard.answerInbound(data)
			.then(data => eventsCalls.callsInbound(data, 'eventAgentConnect'))
			.catch(err => this.handlerError('Error al capturar (answer) de la llamada entrante', err))
	}

	hangup (data) {
		detailDashboard.hangup(data)
			.then(data => eventsCalls.hangup(data))
			.catch(err => this.handlerError('Error al cortar (hangup) llamadas salientes y/o entrantes', err))
	}

	hold (data) {
		detailDashboard.hold(data)
			.then(data => eventsCalls.hold(data))
			.catch(err => this.handlerError('Error al mostrar Hold', err))
	}

	unHold (data) {
		detailDashboard.unhold(data)
			.then(data => eventsCalls.unHold(data))
			.catch(err => this.handlerError('Error al mostrar UnHold', err))
	}

	blindTransfer (data) {
		detailDashboard.blindTransfer(data)
			.then(data => eventsCalls.blindTransfer(data))
			.catch(err => this.handlerError('Error al realizar transferencias ciegas', err))
	}

	attendedTransfer (data) {
		detailDashboard.attendedTransfer(data)
			.then(data => eventsCalls.attendedTransfer(data))
			.catch(err => this.handlerError('Error al realizar transferencias atendidas', err))
	}

	queueCallerJoin (data) {
		detailCallsWaiting.create(data)
			.then(data => eventsCalls.addCallWaiting(data))
			.catch(err => this.handlerError('Error al insertar llamadas encoladas', err))
	}

	queueCallerLeave (data) {
		detailCallsWaiting.delete(data)
			.then(data => eventsCalls.removeCallWaiting(data))
			.catch(err => this.handlerError('Error al eliminar llamadas encoladas', err))
	}

	disconnectAsterisk (data) {
		detailCallsWaiting.deleteAll(data)
			.then(result => eventsCalls.disconnectAsterisk(data))
			.catch(err => this.handlerError('Error al eliminar todas las llamadas encoladas', err))
	}
}

module.exports = EventsAsterisk

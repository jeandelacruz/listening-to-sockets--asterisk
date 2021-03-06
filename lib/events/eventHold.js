import Helper from '../util/helperAsterisk'
import len from 'object-length'

const helper = new Helper()

class EventHold {
	Hold(sendData) {
		let actionJSON = ''
		let holdJSON = ''
		let secondCall = ''

		const dataEmitAsterisk = sendData.dataEmitAsterisk
		const dataPreUpdate = sendData.dataPreUpdate
		const holdInbound = [8, 19, 25]
		const holdOutbound = [9, 20, 29]

		if(len(dataPreUpdate) > 0){
			/**
			* [Valida si el evento anterior es una llamada tipo Inbound o Outbound (Interna, Transfer, Saliente)]
			**/
			if (holdInbound.includes(dataPreUpdate.event_id)) holdJSON = this.pressHoldCallInbound(sendData)
			if (holdOutbound.includes(dataPreUpdate.event_id)) holdJSON = this.pressHoldCallOutbound(sendData)
			if (dataPreUpdate.second_status_call === 1) secondCall = (dataPreUpdate.second_outbound_phone === dataEmitAsterisk['Exten']) ? this.validateHoldinSecondCall(sendData, true) : this.validateHoldinSecondCall(sendData, false)
			actionJSON = Object.assign(holdJSON, secondCall)
			return this.generateResponseJson(actionJSON)
		}
	}


	/**
	* [Crea el objeto que indica un Hold de una llamada tipo Inbound (entrante)]
	**/
	pressHoldCallInbound (sendData) {
		const dataPreUpdate = sendData.dataPreUpdate
		const dataEmitAsterisk = sendData.dataEmitAsterisk
		const secondStatusCall = (dataPreUpdate.second_status_call === 1) ? 1 : 0
		let eventID = (dataPreUpdate.event_id === dataPreUpdate.event_id_old) ? 19 : dataPreUpdate.event_id
		return {
			'statusPause' : 1,
			'agentAnnexed' : (dataEmitAsterisk['CallerIDNum'].length > 4) ? helper.extractAnnex(dataEmitAsterisk) : dataEmitAsterisk['CallerIDNum'],
			'eventId' : helper.nextEvent(eventID, false),
			'eventTime' : sendData.horaActualServer,
			'inboundQueue' : dataPreUpdate.inbound_queue,
			'inboundPhone' : dataPreUpdate.inbound_phone,
			'inboundStart' : dataPreUpdate.inbound_start,
			'eventObservaciones' : 'Evento Asterisk - Inicio ' + helper.nextEvent(dataPreUpdate.event_id, true),
			'secondStatusCall' : secondStatusCall
		}
	}

	/**
	* [Crea el objeto que indica un Hold de una llamada tipo Outbound (saliente)]
	**/
	pressHoldCallOutbound (sendData) {
		const dataPreUpdate = sendData.dataPreUpdate
		const dataEmitAsterisk = sendData.dataEmitAsterisk
		const secondStatusCall = (dataPreUpdate.second_status_call === 1) ? 1 : 0
		return {
			'statusPause' : 1,
			'agentAnnexed' : (dataEmitAsterisk['CallerIDNum'].length > 4) ? helper.extractAnnex(dataEmitAsterisk) : dataEmitAsterisk['CallerIDNum'],
			'eventId' : helper.nextEvent(dataPreUpdate.event_id, false),
			'eventTime' : sendData.horaActualServer,
			'outboundPhone' : dataPreUpdate.outbound_phone,
			'outboundStart' : dataPreUpdate.outbound_start,
			'eventObservaciones' : 'Evento Asterisk - Inicio ' + helper.nextEvent(dataPreUpdate.event_id, true),
			'secondStatusCall' : secondStatusCall
		}
	}

	/**
	* [Crea el objecto que indica que se esta en una segunda, y se presiona el Hold]
	**/
	validateHoldinSecondCall (sendData, secondCall) {
		const dataPreUpdate = sendData.dataPreUpdate
		const dataEmitAsterisk = sendData.dataEmitAsterisk
		if(secondCall) {
			return {
				'secondCall' : true,
				'secondOutboundPhone' : dataEmitAsterisk['Exten'],
				'secondOutboundStart' : sendData.horaActualServer,
				'secondEventId' : 23,
				'secondStatusCall' : 1,
				'changeEventPrimary' : 0
			}
		} else {
			return {
				'secondOutboundPhone' : dataPreUpdate.second_outbound_phone,
				'secondOutboundStart' : dataPreUpdate.second_outbound_start,
				'secondEventId' : dataPreUpdate.second_event_id,
				'secondStatusCall' : 1,
				'changeEventPrimary' : 1,
				'changeSecondStatusCall' :1
			}
		}
	}

	/**
	* [Valida cuando se contesta una llamada saliente (fijos, celular, 0800), valida igualmente si es una segunda llamada]
	*/
	generateResponseJson (data) {
		if (data.agentAnnexed) {
			if (data.secondCall === true) {
				return {
					'agent_annexed': (data.agentAnnexed) ? data.agentAnnexed : '',
					'second_outbound_phone': (data.secondOutboundPhone) ? data.secondOutboundPhone : '',
					'second_outbound_start': (data.secondOutboundStart) ? data.secondOutboundStart : '',
					'second_event_id': (data.secondEventId) ? data.secondEventId : 0,
					'second_status_call' : (data.secondStatusCall) ? data.secondStatusCall : 1,
					'changeEventPrimary' : (data.changeEventPrimary) ? data.changeEventPrimary : 0,
					'changeSecondStatusCall' : (data.changeSecondStatusCall) ? data.changeSecondStatusCall : 0
				}
			} else {
				return {
					'agent_annexed': (data.agentAnnexed) ? data.agentAnnexed : '',
					'agent_status': (data.statusPause) ? data.statusPause : 0,
					'event_id': (data.eventId) ? data.eventId : 0,
					'event_id_old': (data.eventIDOld) ? data.eventIDOld : 0,
					'event_time': (data.eventTime) ? data.eventTime : '',
					'event_observaciones': (data.eventObservaciones) ? data.eventObservaciones : '',
					'inbound_queue': (data.inboundQueue) ? data.inboundQueue : '',
					'inbound_phone': (data.inboundPhone) ? data.inboundPhone : '',
					'inbound_start': (data.inboundStart) ? data.inboundStart : '',
					'outbound_phone': (data.outboundPhone) ? data.outboundPhone : '',
					'outbound_start': (data.outboundStart) ? data.outboundStart : '',
					'second_outbound_phone': (data.secondOutboundPhone) ? data.secondOutboundPhone : '',
					'second_outbound_start': (data.secondOutboundStart) ? data.secondOutboundStart : '',
					'second_event_id': (data.secondEventId) ? data.secondEventId : 0,
					'second_status_call' : (data.secondStatusCall) ? data.secondStatusCall : 0,
					'changeEventPrimary' : (data.changeEventPrimary) ? data.changeEventPrimary : 0
				}
			}
		}
	}

}

module.exports = EventHold

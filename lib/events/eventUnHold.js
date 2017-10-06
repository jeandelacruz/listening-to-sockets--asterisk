import Helper from '../util/helperAsterisk'
import len from 'object-length'

const helper = new Helper()

class EventUnHold {
	unHold(sendData) {
		let actionJSON = ''
		let UnholdJSON = ''
		let secondCall = ''

		const dataEmitAsterisk = sendData.dataEmitAsterisk
		const dataPreUpdate = sendData.dataPreUpdate
		const UnholdInbound = ['16','22','26']
		const UnholdOutbound = ['23','17','28']

		if(len(dataPreUpdate) > 0){
			/**
			* [Valida si el evento anterior es una llamada tipo Inbound o Outbound (Interna, Transfer, Saliente)]
			**/
			UnholdJSON = (UnholdInbound.includes(dataPreUpdate.event_id)) ? this.pressUnHoldCallInbound(sendData) : this.pressUnHoldCallOutbound(sendData)
			secondCall = (dataPreUpdate.second_outbound_phone === dataEmitAsterisk['Exten']) ? this.validateUnHoldinSecondCall(sendData, true) : this.validateUnHoldinSecondCall(sendData, false)
			actionJSON = Object.assign(UnholdJSON, secondCall)

			return this.generateResponseJson(actionJSON)
		}
	}

	/**
	* [Crea el objeto que indica que se quito el Hold en una llamada tipo Inbound (entrante)]
	**/
	pressUnHoldCallInbound (sendData) {
		const dataPreUpdate = sendData.dataPreUpdate
		const dataEmitAsterisk = sendData.dataEmitAsterisk
		return {
			'statusPause' : '1',
		    'agentAnnexed' : (dataEmitAsterisk['CallerIDNum'].length > '4') ? extractAnnex(dataEmitAsterisk) : dataEmitAsterisk['CallerIDNum'],
	        'inboundQueue' : dataPreUpdate.inbound_queue,
	        'inboundPhone' : dataPreUpdate.inbound_phone,
	        'inboundStart' : dataPreUpdate.inbound_start,
	        'eventId' : helper.nextEvent(dataPreUpdate.event_id, false),
	        'eventName' : helper.nextEvent(dataPreUpdate.event_id, true),
	        'eventTime' : sendData.horaActualServer,
	        'eventObservaciones' : 'Evento Asterisk - Fin Hold ' + helper.nextEvent(dataPreUpdate.event_id, true)
		}
	}

	/**
	* [Crea el objeto que indica que se quito el Hold en una llamada tipo Outbound (saliente)]
	**/
	pressUnHoldCallOutbound (sendData) {
		const dataPreUpdate = sendData.dataPreUpdate
		const dataEmitAsterisk = sendData.dataEmitAsterisk
		return {
			'statusPause' : '1',
	        'agentAnnexed' : (dataEmitAsterisk['CallerIDNum'].length > '4') ? extractAnnex(dataEmitAsterisk) : dataEmitAsterisk['CallerIDNum'],
	        'outboundPhone' : dataPreUpdate.outbound_phone,
	        'outboundStart' : dataPreUpdate.outbound_start,
	        'eventId' : helper.nextEvent(dataPreUpdate.event_id, false),
	        'eventName' : helper.nextEvent(dataPreUpdate.event_id, true),
		    'eventTime' : sendData.horaActualServer,
	        'eventObservaciones' : 'Evento Asterisk - Fin Hold ' + helper.nextEvent(dataPreUpdate.event_id, true)
		}
	}

	/**
	* [Crea el objecto que indica que se esta en una segunda, y se presiona el Hold]
	**/
	validateUnHoldinSecondCall (sendData, secondCall) {
		const dataPreUpdate = sendData.dataPreUpdate
		const dataEmitAsterisk = sendData.dataEmitAsterisk
		if(secondCall) {
			return {
				'secondCall' : true,
				'secondEventId' : helper.nextEvent(dataPreUpdate.second_event_id, false),
		        'secondEventName' : helper.nextEvent(dataPreUpdate.second_event_id, true),
		        'secondOutboundPhone' : dataEmitAsterisk['Exten'],
		        'secondOutboundStart' : sendData.horaActualServer
			}
		} else {
			return {
				'secondEventId' : dataPreUpdate.second_event_id,
		        'secondEventName' : dataPreUpdate.second_event_name,
				'secondOutboundPhone' : dataPreUpdate.second_outbound_phone,
		        'secondOutboundStart' : dataPreUpdate.second_outbound_start
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
					'second_event_id': (data.secondEventId) ? data.secondEventId : '',
					'second_event_name': (data.secondEventName) ? data.secondEventName : ''
				}
			} else {
				return {
					'agent_annexed': (data.agentAnnexed) ? data.agentAnnexed : '',
					'agent_status': (data.statusPause) ? data.statusPause : '',
					'event_id': (data.eventId) ? data.eventId : '',
					'event_id_old': (data.eventIDOld) ? data.eventIDOld : '',
					'event_name': (data.eventName) ? data.eventName : '',
					'event_time': (data.eventTime) ? data.eventTime : '',
					'event_observaciones': (data.eventObservaciones) ? data.eventObservaciones : '',
					'inbound_queue': (data.inboundQueue) ? data.inboundQueue : '',
					'inbound_phone': (data.inboundPhone) ? data.inboundPhone : '',
					'inbound_start': (data.inboundStart) ? data.inboundStart : '',
					'outbound_phone': (data.outboundPhone) ? data.outboundPhone : '',
					'outbound_start': (data.outboundStart) ? data.outboundStart : '',
					'second_outbound_phone': (data.secondOutboundPhone) ? data.secondOutboundPhone : '',
					'second_outbound_start': (data.secondOutboundStart) ? data.secondOutboundStart : '',
					'second_event_id': (data.secondEventId) ? data.secondEventId : '',
					'second_event_name': (data.secondEventName) ? data.secondEventName : ''
				}
			}
		}
	}
}

module.exports = EventUnHold
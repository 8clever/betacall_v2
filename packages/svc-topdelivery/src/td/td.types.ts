
export interface TimeInterval {
	bTime: string; // HH:mm:ss time from
	eTime: string; // HH:mm:ss time to
}

export interface Quota {
	date: string;
	quotas: {
		available: number;
	}
	timeInterval: TimeInterval[];
}

export interface Order {
	partnerExecutor: {
		id: string;
	}
	orderIdentity: {
		orderId: number;
		barcode: string;
	},
	accessCode: string;
	deliveryType: object,
	deliveryAddress: {
		region: string;
		inCityAddress: string;
	},
	pickupAddress: {
		id: number;
	},
	clientInfo: {
		phone: string;
	},
	clientAddress: string;
	workStatus: {
		id: number;
		name: string;
	},
	denyParams: {
		type: string;
		reason: {
			id: number;
			name: string;
		}
	},
	event: {
		eventType: {
			id: number,
			name: string;
		},
		comment: string;
	},
	desiredDateDelivery: {
		date: string;
		timeInterval: {
			bTime: string;
			eTime: string;
		}
	};
}
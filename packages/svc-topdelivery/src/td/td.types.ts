
export interface Market {
	orgin: string;
	translate: string;
}

export interface Region {
	name: string;
	utfOffset: string;
}

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

export type Status = 
"done" |
"done_pickup" |
"deny" |
"under_call" |
"replace_date"

export interface Order {
	/** our fields */
	status: Status;
	marketName: string;
	robot: boolean;

	/** TD fields */
	partnerExecutor: {
		id: string;
	}
	orderUrl: string;
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
	},
	regionAndCity: {
		regionUtcOffset: number;
	}
}
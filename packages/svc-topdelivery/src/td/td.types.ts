export interface Order {
	orderIdentity: {
		orderId: number;
		barcode: string;
	},
	accessCode: string;
	deliveryType: object,
	deliveryAddress: {
		inCityAddress: string;
	},
	pickupAddress: {
		id: number;
	},
	clientInfo: object,
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
	desiredDateDelivery: object;
}
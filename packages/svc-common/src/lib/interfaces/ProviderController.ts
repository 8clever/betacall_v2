
export interface ProviderController {
	getOrdersByIds (ids: string[]): object[]

	getNextOrder (): object;
}
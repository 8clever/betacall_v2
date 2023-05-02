
export interface ProviderController {

	undercall (id: string): Promise<null>;

	getOrdersByIds (ids: string[]): object[]

	getNextOrder (): object;
}
import { useAuth } from '@betacall/ui-kit';
import React from 'react';
import { io } from 'socket.io-client';

export enum Provider {
	TOP_DELIVERY = "top-delivery",
  B2CPL = 'b2cpl'
}

const clientMessage = (user: string, topic: string) => {
	return `${user}-${topic}`;
}

export function SocketConnect (props: { provider: Provider }) {

	const { provider } = props;

	const auth = useAuth();
	const { login } = auth.user!;

	React.useEffect(() => {
		const socket = io({
			path: '/api/v1/caller/loop/socket',
			query: {
				provider,
				user: login
			}
		});

		socket.on('connect', () => {
			socket.emit('register');
		});

		socket.on(clientMessage(login, 'registered'), () => {
			console.info(`Loop connected: ${login} - ${provider}`)
		});

		socket.on(clientMessage(login, 'refresh'), (provider: Provider) => {
			/** TODO Complete refresh */
			console.info("Required refresh: " + provider)
		});

		return () => {
			socket.disconnect();
		}
	}, [ login, provider ]);

	return null;
}

const SocketContext = React.createContext<{
	providers: Set<Provider>,
	toggleProvider: (p: Provider) => void;
}>({
	providers: new Set(),
	toggleProvider: () => { /** EMPTY */ }
})

export function SocketProvider (props: { children?: React.ReactNode }) {
	const [ providers, setProviders ] = React.useState(new Set<Provider>());
	
	const toggleProvider = React.useCallback((provider: Provider) => {
		setProviders(state => {
			const upd = new Set([...state]);
			if (upd.has(provider)) upd.delete(provider)
			else upd.add(provider);
			return upd;
		})
	}, []);

	const value = React.useMemo(() => {
		return {
			providers,
			toggleProvider
		}
	}, [ providers ]);

	return (
		<SocketContext.Provider value={value}>
			{[...providers].map(p => {
				return <SocketConnect key={p} provider={p} />
			})}
			{props.children}
		</SocketContext.Provider>
	)
}

export function useSocket () {
	return React.useContext(SocketContext);
}
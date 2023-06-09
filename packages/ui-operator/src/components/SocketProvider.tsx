import { Provider, useAuth } from '@betacall/ui-kit';
import React from 'react';
import { io } from 'socket.io-client';
import { useOrders } from './OrderProvider';
import {} from "@betacall/ui-kit"

const clientMessage = (user: string, topic: string) => {
	return `${user}-${topic}`;
}

export function SocketConnect (props: { provider: Provider }) {

	const { provider } = props;

	const auth = useAuth();
	const login = auth.user?.login;

	const { refresh } = useOrders();

	React.useEffect(() => {
		if (!login) return;

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

		socket.on(clientMessage(login, 'refresh'), () => {
			refresh();
		});

		return () => {
			socket.disconnect();
		}
	}, [ login, provider, refresh ]);

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
	}, [ providers, toggleProvider ]);

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
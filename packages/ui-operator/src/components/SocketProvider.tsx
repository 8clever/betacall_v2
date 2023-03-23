import { Api, useAuth } from '@betacall/ui-kit';
import React from 'react';
import { io } from 'socket.io-client';

export function SocketProvider () {

	const { user } = useAuth();

	React.useEffect(() => {
		if (!user) return;

		const socket = io({
			path: '/api/v1/caller/socket',
			query: {
				user: user.login
			}
		});

		socket.on('connect', () => {
			console.info('Socket connected')
		});

		return () => {
			socket.disconnect();
		}
	}, [ user ]);

	return null;
}
import net from 'net';
import { Transform } from 'stream'
import { EventEmitter } from 'events'
import uuid from 'uuid'

/** Const errors used by module. */
enum ERROR {
	E_AMI_UNDEFINED = "Undefined error.",
	E_AMI_ARGUMENT_HOSTNAME = "Argument 'hostname' missing in function call.",
	E_AMI_ARGUMENT_PORT = "Argument 'port' missing in function call.",
	E_AMI_ARGUMENT_USERNAME = "Argument 'username' missing in function call.",
	E_AMI_ARGUMENT_PASSWORD = "Argument 'password' missing in function call.",
	E_AMI_SOCKED_ERROR = "Could not connect to server. Code: %s.",
	E_AMI_SOCKED_CLOSE = "Lost connection to server.",
	E_AMI_AUTH_FAILED = "Authentication failed."
};

class AMIError extends Error {
	constructor(public message: ERROR, public code?: number) {
		super(message);
	}
}

/**
* Stream parser.
*
* @constructor
* @param {object} options - stream.Transform object
*/
class AMIParser extends Transform {
	_localBuffer = '';

	_transform = function (chunk: Buffer, encoding: string, done: () => void) {
		const eol = "\n",                     // end of line
			eom = ["\n\n", "\r\n\r\n"]
			     // end of message
		let foundEom = -1,
			foundEomStr = '',
			eomIndex = 0,
			tmpLocalBuffer = '',
			message = '';

		// add chunk to local buffer
		this._localBuffer += chunk.toString();

		// temporary variable of local buffer as string
		tmpLocalBuffer = this._localBuffer;

		// try to find end of message with any separator
		eomIndex = 0;
		while (eom[eomIndex]) {

			// search at least one message separator
			while ((foundEom = tmpLocalBuffer.indexOf(eom[eomIndex])) != -1) {
				// we have a message

				// separator found, save it
				foundEomStr = eom[eomIndex];

				// get a message
				message = tmpLocalBuffer.substring(0, foundEom);

				// remove this message from local buffer
				tmpLocalBuffer = tmpLocalBuffer.substring(foundEom + foundEomStr.length);

				// we have a complete message, build key, value pairs
				const lines = message.split(eol),
					messajeJson = {
						raw: message
					}

				let	lineIndex = 0,
					
					key = '',
					value = '',
					foundColon = -1;

				// parse evey line from the message
				while (lines[lineIndex]) {

					// found colon on line
					foundColon = lines[lineIndex].indexOf(':');

					// check if we have a colon in the line
					if (foundColon != -1) {
						// we have a good line let extract key, value pair
						key = lines[lineIndex].slice(0, foundColon).trim();
						value = lines[lineIndex].slice(foundColon + 1).trim();

						if (key.length > 0) {
							// add key, value to object
							messajeJson[key] = value;
						}
					} else {
						// not a good line message, do nothing with it
					}
					lineIndex++;
				}

				// test what type of message we have: response or event
				if (messajeJson['Response'] && messajeJson['ActionID']) {
					// this is a response of on action
					this.emit('response', messajeJson);
				} else if (messajeJson['Event']) {
					// this is an event
					this.emit('event', messajeJson);
				}
			}

			eomIndex++;
		}

		// save the new local buffer
		this._localBuffer = tmpLocalBuffer;

		// tell stream.Transform to continue
		done();
	}
}

interface DataJSON {
	Action?: string;
	ActionID?: string
}

interface Action {
	json?: DataJSON,
	txt?: string;
	cb?: (data: DataJSON) => void;
}

export class AMI extends EventEmitter {

	private actions: Map<Action['json']['ActionID'], Action> = new Map();

	private parser = new AMIParser();

	private socket: net.Socket;

	private run() {
		this.parser.setEncoding('utf8');

		this.parser.on('response', (data: DataJSON) => {
			const actionId = data.ActionID
			if (!actionId) return;

			const action = this.actions.get(actionId);
			const cb = action.cb;
			if (!cb) return;

			this.actions.delete(actionId);
			cb(data);
		});

		this.parser.on('event', (data: { Event?: string }) => {
			if (data['Event']) {
				this.emit('eventAny', data);
				this.emit('event' + data['Event'], data);
			}
		});

		this.socket.on('connect', () => {
			this.action("Login", {
				Username: this.username,
				Secret: this.password,
				Events: "On"
			}, (data: { Response?: string }) => {
				if (data['Response'] == 'Success') {
					this.emit('ready', data);
				} else {
					this.emit('error', new AMIError(ERROR.E_AMI_AUTH_FAILED));
				}
			});
		});

		this.socket.on('error', (err: AMIError) => {
			this.emit('error', new AMIError(ERROR.E_AMI_SOCKED_ERROR, err.code));
		});

		this.socket.on('close', () => {
			this.emit('error', new AMIError(ERROR.E_AMI_SOCKED_CLOSE));
		});

		this.socket.pipe(this.parser);
	}

	constructor(hostname: string, port: number, private username: string, private password: string) {
		super()
		this.socket = net.connect(port, hostname);
		process.nextTick(() => {
			this.run()
		});
	}

	action = (name = "", _data: object = {}, cb: (data: Record<string, string>) => void) => {
		const dataJson: DataJSON = {
			..._data,
			Action: name,
			ActionID: this.actionIDGenerator()
		};

		let dataTxt = '';

		for (const x in dataJson) {
			dataTxt += x + ": " + dataJson[x] + "\r\n";
		}

		dataTxt += "\r\n";

		this.actions.set(dataJson.ActionID, {
			json: dataJson,
			txt: dataTxt,
			cb
		});

		this.socket.write(dataTxt);
	}

	private actionIDGenerator() {
		return uuid.v4();
	}
}
const chatroomList = {
	a8171404823y4uqweihwjdf1243: {
		key: 'a8171404823y4uqweihwjdf1243',
		name: 'dokimastiko',
		userList: [],
	},
};

function leaveChatroom(io, socket, chatroomToLeave) {
	socket.leave(chatroomToLeave);
	if (chatroomList[chatroomToLeave]) {
		console.log(socket.request.user.username + ' left ' + chatroomList[chatroomToLeave].name);
		const index = chatroomList[chatroomToLeave].userList.indexOf(socket.request.user['_id']);
		chatroomList[chatroomToLeave].userList.splice(index, 1);
		//delete chatroom if empty
		if (chatroomList[chatroomToLeave].userList.length === 0)
			delete chatroomList[chatroomToLeave];
	}

	//emit updated list
	io.to(chatroomToLeave).emit('chatroom data', chatroomList[chatroomToLeave]); /////////=========================================================
	socket.broadcast.to(chatroomToLeave).emit('chat message', {
		username: socket.request.user.username,
		type: 'chat notification',
		message: 'has left the chatroom.',
	});
}

module.exports = function (io) {
	io.on('connection', function (socket) {
		let username;
		if (socket.request.user.username) {
			if (socket.request.user.provider === 'GitHub') {
				username = socket.request.user.username + ' ' + '(github)';
			} else {
				username = socket.request.user.username;
			}
		} else {
			username = 'Guest';
		}
		console.log(username + ' has connected, socket id: ' + socket.id);

		let currentChatroom = '';

		socket.on('enter chatroom', function (chatroomKey) {
			if (chatroomList[chatroomKey]) {
				// console.log(socket.request.user.username + ' entered ' + chatroomList[chatroomKey].name);
				// console.log(chatroomList[chatroomKey]);
				if (currentChatroom && chatroomKey !== currentChatroom) {
					//if already in a room, leave current chatroom before joining new one
					leaveChatroom(io, socket, currentChatroom);
				}
				socket.join(chatroomKey);
				currentChatroom = chatroomKey;

				//add user to the users list for the new chatroom
				console.log(`socket.request.user._id: ` + socket.request.user['_id']);
				// const userId = socket.request.user['_id'];
				if (!chatroomList[chatroomKey].userList.includes(username)) {
					// console.log(`${chatroomList[chatroomKey].userList} does not include ${username}`);
					chatroomList[chatroomKey].userList.push(username);
				}
				//emit updated list
				io.to(currentChatroom).emit('chatroom data', chatroomList[currentChatroom]); /////////=========================================================
				console.log('sending chatroom data');
				console.log(chatroomList[currentChatroom]);

				socket.broadcast.to(currentChatroom).emit('chat message', {
					username: socket.request.user.username,
					type: 'chat notification',
					message: 'has joined the chatroom.',
				});
			} else {
				// chatroom does not exist
				console.log(`there is no chatroom with the key: ${chatroomKey}`);
				// io.to(`${socket.id}`).emit('chatroom not found');
				socket.emit('chatroom error', 'This chatroom does not exist');
			}
		});

		//send message to users in the same chatroom
		socket.on('chat message', function (messageData) {
			// console.log(`Message from ${socket.request.user.username}:`);
			// console.log(messageData);
			const { type, chatroomName, message } = messageData;
			io.to(currentChatroom).emit('chat message', {
				username: socket.request.user.username,
				type,
				message: message,
				timestamp: new Date().toLocaleTimeString(),
			});
		});

		socket.on('exit chatroom', function (chatroomKey) {
			leaveChatroom(io, socket, chatroomKey);
			currentChatroom = '';
		});

		socket.on('create chatroom', function (chatroomInfo) {
			const { chatroomKey, chatroomName } = chatroomInfo;
			chatroomList[chatroomKey] = {
				key: chatroomKey,
				name: chatroomName,
				userList: [],
			};
			//emit updated chatroom
			io.to(chatroomKey).emit('chatroom data', chatroomList[chatroomKey]);
		});

		// close socket connection
		socket.on('close', function () {
			console.log('closing socket ' + socket.id);
			socket.disconnect(true);
		});

		socket.on('disconnect', function () {
			console.log(username + ' has disconnected, socket id: ' + socket.id);

			if (currentChatroom) {
				//if in a room, leave current chatroom before disconnect
				leaveChatroom(io, socket, currentChatroom);
			}
		});
	});
};

import io from 'socket.io-client';

export default function () {
	const socket = io();

	function addChatMessageHandler(callback) {
		socket.on('chat message', callback);
	}

	function removeChatMessageHandler() {
		socket.off('chat message');
	}

	function enterChatroom(chatroomName) {
		socket.emit('enter chatroom', chatroomName);
	}

	function exitChatroom(chatroomName) {
		socket.emit('exit chatroom', chatroomName);
	}

	//chatroom emit message
	function emitChatMessage(messageData) {
		socket.emit('chat message', messageData);
	}

	// ======================================================================
	function addChatroomListListener(callback) {
		socket.on('chatroom data', callback);
	}

	function removeChatroomListListener() {
		socket.off('chatroom data');
	}

	function addChatroomErrorListener(callback) {
		socket.on('chatroom error', callback);
	}

	function removeChatroomErrorListener() {
		socket.off('chatroom error');
	}
	// ======================================================================
	// github login
	function addGithubLoginListener(callback) {
		socket.on('github login', callback);
	}

	function removeGithubLoginListener(callback) {
		socket.off('github login');
	}
	// ======================================================================

	function createChatroom(chatroomKey, chatroomName) {
		socket.emit('create chatroom', { chatroomKey, chatroomName });
	}

	socket.on('error', function (err) {
		console.log('Socket error: ' + err);
	});

	return {
		emitChatMessage,
		addChatMessageHandler,
		removeChatMessageHandler,
		enterChatroom,
		exitChatroom,
		addChatroomListListener,
		removeChatroomListListener,
		createChatroom,

		addChatroomErrorListener,
		removeChatroomErrorListener,

		addGithubLoginListener,
		removeGithubLoginListener,

		socketId: socket.id,
	};
}

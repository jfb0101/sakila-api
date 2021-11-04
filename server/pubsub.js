module.exports = {
    publish: (socket,message,data) => {
        socket.emit(message, {
            bar: 'baz',
            fuu: 5
        })
    }
}
import socket from '../out/index'

var buffer = new ArrayBuffer(1)
var dataView = new DataView(buffer)
dataView.setUint8(0, 1)

socket.connectSocket({
    url: 'ws://localhost:8181',
    success: function (e) {
        console.log(e)
        socket.onSocketOpen(function (res) {
            console.log('WebSocket连接已打开！')
            setTimeout(function () {
                socket.sendSocketMessage({
                    // data: 'test'
                    data: buffer
                })
            }, 2000)
        })
        socket.onSocketError(function (res) {
            console.log('WebSocket连接打开失败，请检查！')
        })
        socket.onSocketMessage(function (res) {
            console.log('收到服务器内容：', res.data)
        })
        socket.onSocketClose(function (res) {
            console.log('WebSocket 已关闭！')
        })
    },
    file: function (e) {
        console.error(e)
    }
})
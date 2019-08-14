import { SocketTask } from './SocketTask'
type SocketEvent = 'onOpen' | 'onClose' | 'onError' | 'onMessage'
var globalSocketTask: SocketTask | null = null
var globalEvents: { [key: string]: Function } = {}
/**
 * 创建一个 WebSocket 连接
 * @param data 数据
 */
export function connectSocket(data: any): SocketTask {
    data = data || {}
    var socketTask = new SocketTask(data)
    function clear() {
        globalSocketTask = null
    }
    socketTask.onClose(clear)
    socketTask.onError(clear)
    if (!globalSocketTask) {
        globalSocketTask = socketTask
        for (const event in globalEvents) {
            if (globalEvents.hasOwnProperty(event)) {
                socketTask[<SocketEvent>event](globalEvents[event])
            }
        }
    }
    globalSocketTask = globalSocketTask || socketTask
    return socketTask
}
function on(event: SocketEvent, cb: Function) {
    if (globalSocketTask) {
        globalSocketTask[event](cb)
    } else {
        globalEvents[event] = cb
    }
}
/**
 * 监听WebSocket连接打开事件
 * @param cb 回调
 */
export function onSocketOpen(cb: Function) {
    on('onOpen', cb)
}
/**
 * 监听WebSocket错误
 * @param cb 回调
 */
export function onSocketError(cb: Function) {
    on('onError', cb)
}
/**
 * 通过 WebSocket 连接发送数据
 * @param data 数据
 */
export function sendSocketMessage(data: any) {
    if (globalSocketTask) {
        globalSocketTask.send(data)
    }
}
/**
 * 监听WebSocket接受到服务器的消息事件
 * @param cb 回调
 */
export function onSocketMessage(cb: Function) {
    on('onMessage', cb)
}
/**
 * 关闭WebSocket连接
 * @param data 数据
 */
export function closeSocket(data: any) {
    if (globalSocketTask) {
        globalSocketTask.close(data)
    }
}
/**
 * 监听WebSocket关闭
 * @param cb 回调
 */
export function onSocketClose(cb: Function) {
    on('onClose', cb)
}
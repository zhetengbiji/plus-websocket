import * as $event from './event'
import { callback, plusReady, isWeb } from './utils'
import Base64 from './lib/base64-arraybuffer'

declare const window: any
declare const require: Function

const WEBVIEW_ID = '__websocket__'

/**
 * 首页webSocket.js已注入
 */
var webSocketInjected: boolean

var callbacks: { [key: string]: Function } = {}

var webSocket = require('./inject/webSocket.str.js')

var _webviewReady: boolean = false
var _webviewReadyCallbacks: Function[] = []
var timer: undefined | number
function webviewReady(callback: Function) {
    var webview = plus.webview.getWebviewById(WEBVIEW_ID)
    if (!webview) {
        let html = require('./html/index.html')
        webview = plus.webview.create('http://www.dcloud.io', WEBVIEW_ID, {
            kernel: 'UIWebview',
            render: 'always',
            plusrequire: 'none'
        })
        webview.overrideUrlLoading({
            match: '.*data.*'
        }, (event) => {
            const url = event.url
            // console.log(url)
            var data = url.match(/\?(\S+)=(\S+)/)
            if (data) {
                let action = data[1]
                let detail = JSON.parse(decodeURIComponent(data[2]))
                if (action === 'event') {
                    $event.emit(detail.type, detail.data)
                } else if (action === 'callback') {
                    callbacks[detail.callbackName](detail.error)
                }
            } else if (!_webviewReady && typeof timer !== 'number' && url.indexOf('load') >= 0) {
                timer = setInterval(() => {
                    webview.evalJS(webSocket)
                }, 16)
            } else if (!_webviewReady && url.indexOf('ready') >= 0) {
                clearInterval(timer)
                _webviewReady = true
                _webviewReadyCallbacks.forEach(callback => {
                    callback(webview)
                })
                _webviewReadyCallbacks = []
            }
        })
        webview.loadData(html, {
            baseURL: 'http://websocket.websocket'
        })
    }
    if (_webviewReady) {
        callback(webview)
    } else {
        _webviewReadyCallbacks.push(callback)
    }
}

export class SocketTask {
    private id: string
    /**
     * 构造函数
     * @param id SocketTask ID
     */
    constructor(data: any) {
        this.id = Date.now().toString()
        this.eval('connect', data)
    }
    /**
     * 发送
     * @param data 数据
     */
    send(data: any) {
        if (data.data && typeof data.data !== 'string') {
            data.data = [Base64.encode(data.data)]
        }
        this.eval('send', data)
    }
    /**
     * 关闭
     * @param data 数据
     */
    close(data: any) {
        this.eval('close', data)
    }
    /**
     * 监听开启
     * @param callback 回调
     */
    onOpen(callback: Function) {
        this.on('open', callback)
    }
    /**
     * 监听关闭
     * @param callback 回调
     */
    onClose(callback: Function) {
        this.on('close', callback)
    }
    /**
     * 监听错误
     * @param callback 回调
     */
    onError(callback: Function) {
        this.on('error', callback)
    }
    /**
     * 监听消息
     * @param callback 回调
     */
    onMessage(callback: Function) {
        this.on('message', (data: any) => {
            data = data.data
            data = data && typeof data !== 'string' ? Base64.decode(data[0]) : data
            callback({ data })
        })
    }
    /**
     * 在首页执行
     * @param callback 回调
     */
    private eval(method: string, data: any) {
        var callbackName = `callback${Date.now()}`
        var cbs = isWeb ? window : callbacks
        cbs[callbackName] = (error: any) => {
            delete cbs[callbackName]
            if (error) {
                callback(data, {}, error)
            } else {
                callback(data, {})
            }
        }
        var js = `window.__webSocket&&__webSocket.${method}(${this.id},${JSON.stringify(data)},'${callbackName}')`
        if (isWeb) {
            if (!webSocketInjected) {
                window.eval(webSocket)
                webSocketInjected = true
            }
            window.eval(js)
        } else {
            plusReady(() => {
                webviewReady((webview: PlusWebviewWebviewObject) => {
                    webview.evalJS(js)
                })
            })
        }
    }
    /**
     * 监听事件
     * @param eventName 事件名称
     * @param callback 回调
     */
    private on(eventName: string, callback: Function) {
        $event.on(`websocket${eventName}${this.id}`, (event: any) => {
            callback(event.detail)
        })
    }
}

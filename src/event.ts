import { isWeb } from './utils'

const callbacks: { [key: string]: Function[] } = {}

/**
 * 监听自定义事件
 * @param type 事件名称
 * @param callback 事件监听回调函数
 */
export function on(type: string, callback: any) {
    if (isWeb) {
        window.addEventListener(type, callback, false)
    } else {
        callbacks[type] = callbacks[type] || []
        callbacks[type].push(callback)
    }
}
/**
 * 取消自定义事件监听
 * @param type 事件名称
 * @param callback 事件监听回调函数
 */
export function off(type: string, callback: any) {
    if (isWeb) {
        window.removeEventListener(type, callback, false)
    } else {
        let cbs = callbacks[type]
        if (cbs) {
            cbs.splice(cbs.indexOf(callback), 1)
        }
    }
}
/**
 * 触发自定义事件
 * @param type 事件名称
 * @param data 要传递的数据
 * @param webview 目标webview或者webview ID
 */
export function emit(type: string, data: any) {
    if (isWeb) {
        document.dispatchEvent(new CustomEvent(type, {
            detail: data,
            bubbles: true
        }))
    } else {
        let cbs = callbacks[type]
        cbs && cbs.forEach(cb => {
            cb({
                detail: data
            })
        })
    }
}
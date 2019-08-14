declare const weex: any

/**
 * 是否APP环境
 */
export const isPlus: boolean = typeof navigator === 'object' && !!navigator.userAgent.match(/Html5Plus/i)
export const isWeb: boolean = typeof document === 'object' && !isPlus
export const isWeex: boolean = typeof weex === 'object'
export const isApp: boolean = isPlus || isWeex
/**
 * plus在回调内使用保证plus可用
 * @param cb 回调函数
 */
export function plusReady(cb: Function) {
    if (typeof plus === 'object') {
        cb()
    } else if (isApp) {
        window.addEventListener('plusready', <EventListenerOrEventListenerObject>cb, false)
    }
}
/**
 * 调用方法的参数
 */
export interface MethodData {
    /**
     * 调用成功的回调
     */
    success?: Function
    /**
     * 调用失败的回调
     */
    fail?: Function
    /**
     * 调用成功和失败均执行
     */
    complete?: Function
}
/**
 * 通用返回处理
 * @param data 调换方法传入的原始数据
 * @param successData 执行成功的回调数据
 * @param failData 执行失败的回调数据
 */
export function callback(data: MethodData, successData?: any, failData?: any) {
    // 通用错误消息
    if (successData) {
        if (!successData.errMsg) {
            successData.errMsg = 'callback:ok'
        }
    } else {
        if (typeof failData === 'object') {
            if (!failData) {
                failData = {
                    errMsg: 'callback:fail'
                }
            }
            if (!failData.errMsg) {
                failData.errMsg = failData.message || 'callback:fail'
            }
        } else {
            failData = {
                errMsg: 'callback:fail ' + String(failData)
            }
        }
    }
    if (data && typeof data.success === 'function' && successData) {
        data.success(successData)
    }
    if (failData) {
        console.warn('Callback Fail:', failData)
    }
    if (data && typeof data.fail === 'function' && failData) {
        data.fail(failData)
    }
    if (data && typeof data.complete === 'function') {
        data.complete(successData || failData)
    }
}
/**
 * 返回通用返回方法
 */
export function getCallback(): Function {
    return callback
}

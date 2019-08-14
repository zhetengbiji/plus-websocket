(function () {
    if (window.__webSocket) {
        return
    }
    var isPlus = typeof navigator === 'object' && !!navigator.userAgent.match(/Html5Plus/i)
    if (isPlus) {
        location.href = 'http://data?ready'
    }
    // 自定义事件
    var $event = {
        emit (type, data) {
            if (!isPlus) {
                document.dispatchEvent(new CustomEvent(type, {
                    detail: data,
                    bubbles: true
                }))
                return
            }
            location.href = 'http://data?event=' + encodeURIComponent(JSON.stringify({
                type,
                data
            }))
        }
    }
    var Base64 = {
        chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        lookup: null,
        encode: function (arraybuffer) {
            var chars = this.chars;
            var bytes = new Uint8Array(arraybuffer),
                i, len = bytes.length, base64 = "";

            for (i = 0; i < len; i += 3) {
                base64 += chars[bytes[i] >> 2];
                base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
                base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
                base64 += chars[bytes[i + 2] & 63];
            }

            if ((len % 3) === 2) {
                base64 = base64.substring(0, base64.length - 1) + "=";
            } else if (len % 3 === 1) {
                base64 = base64.substring(0, base64.length - 2) + "==";
            }

            return base64;
        },
        decode: function (base64) {
            var chars = this.chars;
            var lookup = this.lookup
            if (!lookup) {
                lookup = this.lookup = new Uint8Array(256);
                for (var i = 0; i < chars.length; i++) {
                    lookup[chars.charCodeAt(i)] = i;
                }
            }
            var bufferLength = base64.length * 0.75,
                len = base64.length, p = 0,
                encoded1, encoded2, encoded3, encoded4;

            if (base64[base64.length - 1] === "=") {
                bufferLength--;
                if (base64[base64.length - 2] === "=") {
                    bufferLength--;
                }
            }

            var arraybuffer = new ArrayBuffer(bufferLength),
                bytes = new Uint8Array(arraybuffer);

            for (i = 0; i < len; i += 4) {
                encoded1 = lookup[base64.charCodeAt(i)];
                encoded2 = lookup[base64.charCodeAt(i + 1)];
                encoded3 = lookup[base64.charCodeAt(i + 2)];
                encoded4 = lookup[base64.charCodeAt(i + 3)];

                bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
                bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
                bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
            }

            return arraybuffer;
        }
    }

    window.__webSocket = {
        webSockets: {},
        connect (id, data, callbackName) {
            var url = data.url
            var header = data.header// 未支持
            var method = data.method// 未支持
            var protocols = data.protocols || []
            var webSocket
            try {
                webSocket = this.webSockets[id] = new WebSocket(url, protocols)
                webSocket.binaryType = 'arraybuffer'
            } catch (error) {
                this.callback(callbackName, error)
                return
            }
            this.callback(callbackName)
            if (webSocket) {
                webSocket.addEventListener('open', () => {
                    $event.emit(`websocketopen${id}`, {})
                })
                webSocket.addEventListener('message', ({ data }) => {
                    $event.emit(`websocketmessage${id}`, {
                        data: data && typeof data !== 'string' ? [Base64.encode(data)] : data
                    })
                })
                webSocket.addEventListener('error', () => {
                    $event.emit(`websocketerror${id}`, {})
                })
                webSocket.addEventListener('close', () => {
                    $event.emit(`websocketclose${id}`, {})
                })
            }
        },
        send (id, data = {}, callbackName) {
            data = data.data
            data = data && typeof data !== 'string' ? Base64.decode(data[0]) : data
            try {
                this.webSockets[id].send(data)
            } catch (error) {
                this.callback(callbackName, error)
                return
            }
            this.callback(callbackName)
        },
        close (id, data = {}, callbackName) {
            var options = []
            options.push(data.code || 1000)
            if (typeof data.reason === 'string') {
                options.push(data.reason)
            }
            try {
                this.webSockets[id].close(...options)
            } catch (error) {
                this.callback(callbackName, error)
                return
            }
            this.callback(callbackName)
        },
        callback (callbackName, error) {
            if (isPlus) {
                location.href = 'http://data?callback=' + encodeURIComponent(JSON.stringify({
                    callbackName,
                    error
                }))
            } else {
                var js = `window.${callbackName}&&window.${callbackName}('${error || ''}')`
                window[callbackName] && window[callbackName](error | '')
                window.eval(js)
            }
        }
    }
})()
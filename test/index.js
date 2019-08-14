var api = require('../out/index')

var index = 0
for(const key in api) {
    if(api.hasOwnProperty(key)) {
        index++
        console.log(index, key)
    }
}
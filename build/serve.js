const express = require('express')
const app = express()
const http = require('http')
const port = '3118'
//在浏览器中打开 下面执行
const opn = require('opn')

//启动压缩
const compression = require('compression')
const path = require('path')
app.use(compression())

//静态页面路径
app.use(express.static(path.resolve(__dirname, '../dist')))
app.set('port', port)

//启动server
const server = http.createServer(app)
server.listen(port)

server.on('listening', onListening)

function onListening() {
    console.log(
        `server port 3118 listening and open browser with http://localhost:${port}....`
    )
    // opn(`http://localhost:${port}`, 'chrome')
}

const http = require('http')
const httpProxy = require('http-proxy')
const fs = require('fs')
const path = require('path')

const utils = require('./utils/utils')

const proxy = httpProxy.createProxyServer()

const server = () => {
	const configPath = path.join(__dirname, 'config.js')
	fs.chmodSync(configPath, '0755')

	let config = require('./config')
	
	const targetUrl = `${config.protocol}://${config.domain}:${config.port}`
	console.log(targetUrl)

	http.createServer((req, res) => {
		const host = req.headers.host
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

		try {
			if (config.mock && req.url) {
				const result = utils.parseUrl(req.url)
				const jsonFilePath = result.jsonFilePath
				const fileName = result.fileName
				const relativePath = path.join(process.cwd(), jsonFilePath)

				if (jsonFilePath !== '' && fs.existsSync(relativePath) && jsonFilePath !== 'mock/') {
					const file = fs.readFileSync(`${relativePath}/${fileName}.json`, 'utf8')
					const returnValue = new Function(`const a = ${file}; return a;`)()
					const json = JSON.stringify(returnValue)

					res.writeHead(200, {'Content-Type': 'application/json;charset=utf8'});
					res.write(json);
					res.end();
					return;
				}
			}
		} catch (e) {
			console.log(e)
		}


		proxy.web(req, res, {
			target: targetUrl,
			secure: false,
			changeOrigin: true
		})
	}).listen(3000)


	proxy.on('proxyRes', (proxyRes, req, res) => {
		proxy.on('end', () => {
			// console.log('proxyEnd')
		})
	})

	proxy.on('error', (err, req, res) => {
	  res.writeHead(500, {
	    'Content-Type': 'text/plain'
	  })
	  res.end('Something went wrong. And we are reporting a custom error message.')
	  console.log(err)
	})

	console.log(`Proxy server is running on port 3000`)
}


module.exports = server;

#!/usr/bin/env node
const readline = require('readline')
const fs = require('fs')
const path = require('path')

const proxyServer = require('../app')
const packageJson = require('../package.json')
const utils = require('../utils/utils')

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
})


const init = () => {
	console.log(`
			欢迎使用本Mock工具
			为了保持工具的高大上与不接地气
			初始化过程全部采用盎格鲁-萨克逊语
			呵呵
	`)

	rl.question('Please enter your target\'s domain (like local.meicai.com): ', domain => {

		console.log(`
			Your domain is ${domain}
		`)

		rl.question('Please enter your target\'s port (defulat 80, not proxy server port): ', port => {

			const targetPort = port ? port : 80

			const content = `
				const config = {
					protocol: 'http',
					domain: '${domain}',
					port: ${targetPort},
					mock: true
				}

				module.exports = config
			`
			const configPath = path.join(__dirname, '../config.js')
			console.log(configPath)

			fs.chmodSync(configPath, '0755')
			fs.writeFileSync(configPath, content, () => {})

			console.log(`
			Your target port is ${targetPort}
			Now your target url is http://${domain}:${targetPort}
			You can create a json file in mock folder.
			The path of file will become the url.

			Attention: You may need to add following line to '/etc/hosts'
			127.0.0.1  local.yunshanmeicai.com #repalce your domain here
			`)

			fs.mkdir('./mock', () => { })

			proxyServer()
			ignore()

			rl.close()
		})

	})
}

const ignore = () => {
	fs.appendFile('.gitignore', 'mock/', () => {})
}

const add = () => {

	rl.question(`Please enter your target url search (like '/mall/api/trade'): `, async url => {
		const result = utils.parseUrl(url.trim())
		const fileName = result.fileName
		const jsonFilePath = result.jsonFilePath
		await utils.dirExist(path.join('./', jsonFilePath))

		console.log(`The json file has been created in ./mock${url}.json`)
		console.log(path.join(`${url.trim()}.json`))

		fs.writeFileSync(path.join('./mock', path.join(`${url.trim()}.json`)), '// 请将后端的JSON内容复制到这里', () => {})

		rl.close()
	})
}


const help = () => {
	console.log(`
	欢迎使用本Mock工具
	本工具与你想的那个mockjs工具
	并没有一毛钱的关系 :D

	Current version is ${packageJson.version}
	Please run like this:

	smock --init      Initailization and start
	smock --start     Start proxy server
	smock --add      	Add new url
	smock --help      The use of this
	smock --ignore    Add mock floder to .gitignore


	For example:
	When you create a json file named 'list' in /mock/mall/api/coupon/,
	you will be recevied it when you request targetUrl/mall/api/coupon/list.
	`)
	rl.close()
}


if (process.argv && process.argv[2]) {
	switch (process.argv[2]) {
		case '--init':
			init()
			break
		case '--add':
			add()
			break
		case '--ignore':
			ignore()
			break
		case '--help':
			help()
			break
		case '--start':
			proxyServer()
			break
		default:
			help()
			break
	}
} else {
	help()
}

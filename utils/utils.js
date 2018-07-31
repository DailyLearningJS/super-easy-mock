const path = require('path')
const fs = require('fs')


const utils = {
	parseUrl(url) {
		const paths = url.split('/')
		const len = paths.length

		if (!len || len === 0) {
			return {
				fileName: '',
				jsonFilePath: ''
			}
		}

		return {
			fileName: paths[len - 1],
			jsonFilePath: `mock${url.slice(0, url.lastIndexOf(paths[len - 1]))}`
		}
	},
	getStat(path) {
		return new Promise ((resolve, reject) => {
			fs.stat(path, (err, stats) => {
				if (err) {
					resolve(false)
				} else {
					resolve(stats)
				}
			})
		})
	},
	mkdir(dir) {
		return new Promise((resolve, reject) => {
			fs.mkdir(dir, err => {
				if (err) {
					resolve(false)
				} else {
					resolve(true)
				}
			})
		})
	},
	async dirExist(dir) {
		const isExist = await this.getStat(dir)
		if (isExist && isExist.isDirectory()) {
			return true
		} else if (isExist) {
			return false
		}

		const tempDir = path.parse(dir).dir
		const status = await this.dirExist(tempDir)
		let mkdirStatus
		if (status) {
			mkdirStatus = await this.mkdir(dir)
		}

		return mkdirStatus
	}
}

module.exports = utils

'use strict'

const { Transform } = require('stream')

class Liner extends Transform {

    constructor(options={}) {
        super({ objectMode: true })

        this.delimiter = options.delimiter || undefined
        this.hasHeader = options.header || false

        this.parsed = []
        this.delimiters = [',', '\t', ';', '|', '^']
        this.firstLine = true
        this.header = []
    }

    _transform(chunk, encoding, done) {
        var data = chunk.toString()
        if (this._lastLineData) data = this._lastLineData + data

        const lines = data.split('\n')
        
        if (!this.delimiter)
            this.delimiter = this.findDelimiter(lines)
        
        this._lastLineData = lines.splice(lines.length - 1, 1)[0]

        this.__parse(lines)
        this.parsed.forEach(this.push.bind(this))
        this.parsed = []

        done()
    }

    _flush(done) {
        if (this._lastLineData) {
            this.__parse([this._lastLineData])
            this.push(this.parsed[0])
            this.parsed = []
        }
        this._lastLineData = null
        done()
    }

    __parse(lines) {
        lines.forEach(line => {
            const elements = line.split(this.delimiter)
                .map(x => x.replace(' ', ''))

            if (this.hasHeader && this.firstLine) {
                this.header = elements
                this.firstLine = false
            }

            const obj = {}

            if (this.hasHeader)
                elements.map((x, i) => obj[this.header[i]] = x)
            else 
                elements.map((x, i) => obj[i] = x)
            
            this.parsed.push(JSON.stringify(obj))
        })
    }

    findDelimiter(lines) {
        const frequency = []

        for (const line of lines) {
            const temp = []
            for (const delim of this.delimiters)
                temp.push(line.split(delim).length - 1)
            frequency.push(temp)
        }

        return this.delimiters[this.getMostPopularValue(this.getMaxNumberIndex(frequency))]
    }

    // Get most popular value in array
    getMostPopularValue(arr) {
        return arr.sort((a, b) =>
            arr.filter(v => v === a).length
            - arr.filter(v => v === b).length
        ).pop()
    }

    getMaxNumberIndex(arr) {
        return arr.map(el => el.indexOf(Math.max(...el)))
    }
}

module.exports = Liner

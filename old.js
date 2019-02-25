'use strict'

const fs = require('fs')
const path = require('path')
const filename = path.join(__dirname, 'small.csv')

const readable = fs.createReadStream(filename, { highWaterMark: 64 * 3 })

const data = []
const limit = 10
const delimiters = [',', '\t', ';', '|', '^']

let len = 0
let overshot = ''
let lines = ''
let storage = ''
let firstTime = true
let delimiter = ''

readable.on('data', chunk => {
    const schunk = chunk.toString()
    len += schunk.split('\n').length - 1
    lines = schunk.slice(0, schunk.lastIndexOf('\n'))

    if(overshot)
        lines = overshot + lines

    if (len > limit) {
        if (firstTime) {
            delimiter = findDelimiter(storage)

            console.log({ delimiter })

            firstTime = false
            lines = storage + lines
        }

        lines = lines.split('\n')

        data.push(lines.map(x => x.split(delimiter)))
    } else {
        storage += lines
    }

    overshot = schunk.slice(schunk.lastIndexOf('\n'))
})

readable.on('end', () => {
    console.dir(data)
})

const findDelimiter = storage => {
    const lines = storage.split('\n')
    const lineDelimiters = []

    for (const line of lines) {
        let frequencies = delimiters.map(d => line.split(d).length - 1)
        let lineDelimiterIndex = frequencies.indexOf(Math.max(...frequencies))
        lineDelimiters.push(lineDelimiterIndex)
    }

    const delimiter = delimiters[mode(lineDelimiters)]

    return delimiter
}

// Most popular value in array
const mode = arr => arr.sort((a, b) =>
        arr.filter(v => v === a).length
        - arr.filter(v => v === b).length
    ).pop()
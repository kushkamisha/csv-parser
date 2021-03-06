'use strict'

const fs = require('fs')
const Liner = require('./liner')
const source = fs.createReadStream('data/small.csv')
const liner = new Liner({
    // delimiter: ',',
    // header: true
})

source
    .pipe(liner)
    // .pipe(process.stdout)

liner.on('readable', () => {
    let line
    while (null !== (line = liner.read())) {
        // eslint-disable-next-line no-console
        console.log(JSON.parse(line))
    }
})
'use strict'

const fs = require('fs')
const Liner = require('./liner')
const source = fs.createReadStream('data/small.csv')
const liner = new Liner({
    delimiter: '\t',
    header: true
})

source
    .pipe(liner)
    // .pipe(process.stdout)

liner.on('readable', () => {
    let line
    while (null !== (line = liner.read())) {
        console.log(JSON.parse(line))
    }
})
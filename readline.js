#!/usr/bin/env node

import * as readline from 'node:readline:promises'
import { text } from 'node:stream/consumers'

// const ttt = await text(process.stdin)
// console.log("🚀 ~ text:", ttt)
// process.stdin.destroy()


    // const rl = readline.createInterface({
    //   input: process.stdin,
    //   output: process.stdout,
    //   // terminal: false
    // })
    // rl.on('line', (line) => textFile += line)
    // rl.on('close', () => console.log('done'))
    // rl.close()

    // this breaks rl.question below
    // for await (const chunk of process.stdin) textFile += chunk
    // process.stdin.pause()

    const rl: readline.Interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    // clear stdin here?
    // process.stdin.destroy()
    rl.on('close', () => {
      console.info('done')
    })

    const answer: string = await rl.question(`File ${mp3Path} already exists. Do you want to overwrite it? (y/n) `)
    rl.close()

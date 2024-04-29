#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import * as readlinePromise from 'node:readline/promises'
import readline from 'node:readline'
import { URLSearchParams } from 'node:url'
import { ParseArgsConfig, parseArgs } from 'node:util'
import { text } from 'node:stream/consumers'

// const ttt = await text(process.stdin)
// console.log("🚀 ~ text:", ttt)
// process.stdin.destroy()

// globals
const VOICERSS_APIKEY = process.env.VOICERSS_APIKEY || ''
const DEST_FOLDER = '/d/Radio'
const SCRIPTNAME = path.basename(process.argv[1], '.js')
const FILE: string | undefined = process.argv[2]
let EXT: string
let FILENAME: string
if (FILE) {
  EXT = path.extname(FILE)
  FILENAME = path.basename(FILE, EXT)
} else {
  FILENAME = 'teetoes'
}
const TEXT_LIMIT = 40000 // 100KB limit in docs, everything over 40K fails

// parse args
const argOptions: Record<string, any> = {
  'help': {
    short: 'h',
    type: 'boolean',
    default: false,
    description: 'this help',
  },
  'lang': {
    short: 'l',
    type: 'string',
    default: 'en-us',
    description: 'choose language (default: en-us)',
  },
  'voice': {
    short: 'v',
    type: 'string',
    description: 'choose voice (default: Linda)',
    default: 'Linda',
  }
}

interface Args {
  values: {
    [key: keyof typeof argOptions]: string | boolean | (string | boolean)[] | undefined
  }
  positionals: string[]
}

const { values, positionals }: Args = parseArgs({ options: argOptions, allowPositionals: true, })
console.info(values, positionals)

if (values.help) {
  console.info(`
  ${SCRIPTNAME} [options] <filepath>
  -h, --help
    ${argOptions.help.description}
  -l, --lang
    ${argOptions.lang.description}
  -v, --voice
    ${argOptions.voice.description}

  <filepath> - path to a text you want to convert to mp3
  `)
  process.exit(0)
}

/**
 * Asynchronously executes the main logic of the program.
 *
 * @return {Promise<void>} A promise that resolves when the main logic is complete.
 * @throws {Error} If there is an error reading the file or making the API request.
 */
async function main() {

  let textFile: string = 'boooo'
  if (FILE) {
    const stats: fs.Stats = fs.statSync(FILE)
    console.info(`${FILE} has a size of ${stats.size / 1000} KB`)
    textFile = fs.readFileSync(FILE, 'utf8')
  } else {
    // const rl = readline.createInterface({
    //   input: process.stdin,
    //   output: process.stdout,
    //   // terminal: false
    // })
    // rl.on('line', (line) => textFile += line)
    // rl.once('close', () => console.log('done'))
    // rl.close()

    // this breaks rl.question below
    // for await (const chunk of process.stdin) textFile += chunk
    // readline.
    // process.stdin.pause()
    console.log("🚀 ~ main ~ textFile:", textFile)
  }
  const textArr: string[] = sliceTextTochunks(textFile)
  console.info('total length:', textFile.length)
  console.info(`processing in ${textArr.length} 40K parts...`)

  const buffArr: Promise<Buffer>[] = []

  for (const text of textArr) {
    const formObj: Record<string, any> = {
      key: VOICERSS_APIKEY,
      hl: values.lang,
      v: values.voice,
      src: text, // see TEXT_LIMIT
      r: 0, // speed (-10 to 10)
      c: 'mp3',
      f: '44khz_16bit_stereo',
      b64: false,
    }

    const buff: Promise<Buffer> = fetch('https://api.voicerss.org/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams(formObj).toString()
    }).then(async (res: Response) => {

      if (res.status == 200) {
        const arrayBuf: ArrayBuffer = await res.arrayBuffer()

        if (Buffer.byteLength(arrayBuf, 'binary') <= 1) {
          throw new Error(`Buffer is empty, length: ${Buffer.byteLength(arrayBuf, 'binary')}`)
        }

        return await Buffer.from(arrayBuf)
      } else {
        throw new Error(res.toString())
      }
    })

    buffArr.push(buff)
  }

  const bin: Buffer = await Promise.all(buffArr)
    .then(bins => Buffer.concat(bins))

  try {

    if (bin.includes('ERROR')) {
      throw new Error(bin.toString())
    }

    const mp3Path = `${DEST_FOLDER}/${FILENAME}.mp3`

    if (fs.existsSync(mp3Path)) {
      const rl: readlinePromise.Interface = readlinePromise.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ':::::',
        // terminal: false
      })
      // clear stdin here?
      // process.stdin.destroy()
      rl.on('close', () => {
        console.info('done')
      })


        const answer: string = await rl.question(`File ${mp3Path} already exists. Do you want to overwrite it? (y/n) `)
        rl.close()
        console.log("🚀 ~ main ~ answer:", answer)
        if (answer !== 'y') {
          console.info('Canceling...')
          process.exit(1)
        }
    }



    fs.writeFileSync(mp3Path, bin, { encoding: 'binary' })
    console.info(`${mp3Path} has been saved`)

  } catch (err) {
    throw err
  }
}


main().then(() => {
  console.info('All done')
}).catch(err => {
  console.error(err)
  process.exit(1)
})

/**
 * Slices text to TEXT_LIMIT chunks cos all bigger ones fail with empty buffer
 */
function sliceTextTochunks(text: string): Array<string> {
  const slicedArr = []
  const textLength = text.length
  let start = 0
  while (textLength >= start) {
    slicedArr.push(text.slice(start, start += TEXT_LIMIT))
  }
  return slicedArr
}

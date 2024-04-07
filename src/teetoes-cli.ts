#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { URLSearchParams } from 'node:url'
import { parseArgs } from 'node:util'

console.log(process.argv)
// globals
const VOICERSS_APIKEY = process.env.VOICERSS_APIKEY || ''
const DEST_FOLDER = '/d/Radio'
const SCRIPTNAME = path.basename(process.argv[1], '.js')
const FILE = process.argv[2]
const EXT = path.extname(FILE)
const FILENAME = path.basename(FILE, EXT)

// parse args
// const args = ['-h', '--bar', 'b']
const options: Record<string, any> = {
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
const { values, positionals } = parseArgs({ options, allowPositionals: true, })
console.log(values, positionals)

if (values.help) {
  console.log(`
  ${SCRIPTNAME} [options] <filepath>
  -h, --help
    ${options.help.description}
  -l, --lang
    ${options.lang.description}
  -v, --voice
    ${options.voice.description}

  <filepath> - path to a text you want to convert to mp3
  `)
  process.exit(0)
}


process.exit(0)
async function main() {

  try {
    const stats = fs.statSync(FILE)
    console.log(`${FILE} has a size of ${stats.size / 1000} KB`)
  } catch (err) {
    throw err
  }
  const fileText = fs.readFileSync(FILE, 'utf8')
  const textArr = sliceTextTochunks(fileText)
  console.log('total length:', fileText.length)
  console.log(`processing in ${textArr.length} 40K parts...`)

  const buffArr: Buffer[] = []

  for (const text of textArr) {
    const formObj: Record<string, any> = {
      key: VOICERSS_APIKEY,
      hl: values.lang,
      v: values.voice,
      src: text, // 100KB limit in docs, everything over 40K fails
      r: 0, // speed (-10 to 10)
      c: 'mp3',
      f: '44khz_16bit_stereo',
      b64: false,
    }

    const buff = fetch('https://api.voicerss.org/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams(formObj).toString()
    }).then(async (res: Response) => {

      if (res.status == 200) {
        const arrayBuf: ArrayBuffer = await res.arrayBuffer()

        if (Buffer.byteLength(arrayBuf, 'binary') <= 1) {
          throw new Error(`Buffer is empty, length: ${Buffer.byteLength(arrayBuf, 'binary')}`)
        }

        buffArr.push(Buffer.from(new Uint8Array(arrayBuf)))
      }
      else throw new Error(res.toString())
    })

    const bin: Buffer = await Promise.all(buffArr)
      .then(bins => Buffer.concat(bins))

    try {
      if (bin.includes('ERROR')) {
        throw new Error(bin.toString())
      }
      fs.writeFileSync(`${DEST_FOLDER}${FILENAME}.mp3`, bin, { encoding: 'binary' })
      console.log(`${DEST_FOLDER}${FILENAME}.mp3 has been saved`)
    } catch (err) {
      throw err
    }
  }
}

main().then(() => {
  console.log('All done')
}).catch(err => {
  console.log(err)
  process.exit(1)
})

/**
 * Slices text to 40K chunks cos all bigger ones fail with empty buffer
 */
function sliceTextTochunks(text: string): Array<string> {
  const length = text.length
  const slicedArr = []
  let start = 0
  const end = 40000
  while (length >= start) {
    slicedArr.push(text.slice(start, start += end))
  }
  return slicedArr
}

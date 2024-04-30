#!/usr/bin/env node

import fs, { PathLike } from 'node:fs'
import path from 'node:path'
import * as readline from 'node:readline/promises'
import { URLSearchParams } from 'node:url'
import { parseArgs } from 'node:util'


// get envs
const envs = fs.readFileSync('.env', 'utf8')
envs.split('\n').forEach((env) => {
  const [key, value] = env.split('=')
  process.env[key] = value
})

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
  },
  'speed': {
    short: 's',
    type: 'string',
    description: 'choose speed (-10 to 10, default: 0)',
    default: '0',
  },
}

interface Args {
  values: {
    [key: keyof typeof argOptions]: string | boolean | (string | boolean)[] | undefined
  }
  positionals: string[]
}

const { values, positionals }: Args = parseArgs({ options: argOptions, allowPositionals: true, })

const SCRIPT_NAME = path.basename(process.argv[1])
if (values.help) {
  process.stdout.write(`
${SCRIPT_NAME}: Text to speech on command line

Usage: ${SCRIPT_NAME} [options] <text_file_path>

  -h, --help
    ${argOptions.help.description}
  -l, --lang
    ${argOptions.lang.description}
  -v, --voice
    ${argOptions.voice.description}
  -s --speed
    ${argOptions.speed.description}

  <text_file_path>
    path to a text file you want to convert to audio

  See other language & voice options at: https://voicerss.org/api/demo.aspx
  Repository: https://github.com/fraasi/teetoes-cli
  `)
  process.exit(0)
}

if (values.lang === 'fi-fi') values.voice = 'Aada'
process.stdout.write(`Using lang: ${values.lang} and voice: ${values.voice}\n`)

// globals
const VOICERSS_APIKEY = process.env.VOICERSS_APIKEY || ''
const DEST_FOLDER = process.env.TEETOES_DEST_FOLDER || '.'
const FILE: PathLike = positionals[0]
if (!FILE) throw ` No text file specified! See ${SCRIPT_NAME} --help`

const EXT = path.extname(FILE)
const FILENAME = path.basename(FILE, EXT)
const TEXT_LIMIT = 40000 // 100KB limit in docs, everything over 40K fails with empty buffer


/**
 * Asynchronously executes the main logic of the program.
 *
 * @return {Promise<void>} A promise that resolves when the main logic is complete.
 * @throws {Error} If there is an error reading the file or making the API request.
 */
async function main() {

  const stats = fs.statSync(FILE)
  const textFile = fs.readFileSync(FILE, 'utf8')
  if (textFile.length === 0) throw `${FILE} seem to be empty! Nothing to convert to audio.`
  const textArr: string[] = sliceTextTochunks(textFile)
  process.stdout.write(`${FILE} has a size of ${stats.size / 1000} KB and length of: ${textFile.length}\n`)
  process.stdout.write(`processing in ${textArr.length} ${TEXT_LIMIT / 1000}K parts...`)
  const clearProgressSpinner: Function = progressSpinner()

  const buffArr: Promise<Buffer>[] = []

  for (const text of textArr) {
    const formObj: Record<string, any> = {
      key: VOICERSS_APIKEY,
      hl: values.lang,
      v: values.voice,
      src: text, // see TEXT_LIMIT
      r: Number(values.speed),
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

  clearProgressSpinner()

  try {

    if (bin.includes('ERROR')) {
      throw new Error(bin.toString())
    }

    const mp3Path = `${DEST_FOLDER}/${FILENAME}.mp3`

    if (fs.existsSync(mp3Path)) {
      const rl: readline.Interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const answer: string = await rl.question(`File ${mp3Path} already exists. Do you want to overwrite it? (y/n) `)
      rl.close()
      if (answer !== 'y') {
        process.stdout.write('Canceling...\n')
        process.exit(1)
      }
    }

    fs.writeFileSync(mp3Path, bin, { encoding: 'binary' })
    process.stdout.write(`${mp3Path} has been saved\n`)

  } catch (err) {
    throw err
  }
}

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

/**
 * Creates a progress spinner that animates a series of characters at regular intervals.
 *
 * @return {() => void} A function that clears the interval and moves the cursor to a new line.
 */
function progressSpinner(): () => void {
  const ticks = ['|', '/', '—', '\\']
  let i = 0
  let intValID: NodeJS.Timeout = setInterval(() => {
    process.stdout.write(ticks[i++ % ticks.length])
    process.stdout.moveCursor(-1, 0)
  }, 200)

  return () => {
    clearInterval(intValID)
    process.stdout.write('\n')
  }
}

main().then(() => {
  console.info('All done')
}).catch(err => {
  console.error(err)
  process.exit(1)
})

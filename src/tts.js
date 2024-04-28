#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

async function main() {
  const file = process.argv[2]
  const ext = path.extname(file)
  const filename = path.basename(file, ext)
  try {
    const stats = fs.statSync(file)
    console.log(`${file} has a size of ${stats.size / 1000} KB`)
  } catch (err) {
    throw err
  }
  const text = fs.readFileSync(file, 'utf8')
  const textArr = sliceAndDiceArray(text)
  console.log('total length:', text.length)
  console.log(`processing in ${textArr.length} 40K parts...`)

  const buffArr = []

  for (const text of textArr) {
    const formObj = {
      key: process.env.VOICERSS_APIKEY,
      hl: 'fi-fi',
      v: 'Aada',
//       hl: 'en-us',
//       v: 'Linda',
      src: text, // 100KB limit in docs
      r: 0, // speed (-10 to 10)
      c: 'mp3',
      f: '44khz_16bit_stereo',
      b64: false,
    }

    const buff = fetch('https://api.voicerss.org/', {
      method: 'POST',
      headers:{ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: new URLSearchParams(formObj).toString()
    }).then( res => {
      if (res.status == 200) return res.arrayBuffer()
      throw new Error(Buffer.from(res, 'binary').toString())
    }).then (buf => {
      if (Buffer.byteLength(buf, 'binary') <= 1) {
        throw new Error(`Buffer is empty, length: ${Buffer.byteLength(buf, 'binary') }`)
      }
      return Buffer.from(buf, 'binary')
    })
    buffArr.push(buff)
  }

  const bin = await Promise.all(buffArr)
    .then(bins => Buffer.concat(bins))

  try {
    if (bin.includes('ERROR')) {
      throw new Error(bin)
    }
    fs.writeFileSync(`/d/Radio/${filename}.mp3`, bin, { encoding: 'binary' })
    console.log(`/d/Radio/${filename}.mp3 has been saved`)
  } catch (err) {
    throw err
  }

}

main().then(() => {
  console.log('All done')
}).catch(err => {
  console.log(err)
  process.exit(1)
})

/**
 * Slices text over 40K & returns array of text
 * @param {string} text
 * @return {Array} Array of strings
 */
function sliceAndDiceArray(text) {
  const length = text.length
  const slicedArr = []
  let start = 0
  const end = 40000
  while (length >= start) {
    slicedArr.push(text.slice(start, start += end))
  }
  return slicedArr
}

#!/usr/bin/env node
const fs = require('fs')
const { spawn } = require('child_process')
const moment = require('moment')
const app = require('commander')
const mkdirp = require('mkdirp')

const repoPath = process.env.HOME + '/.worked'
fs.accessSync(repoPath)

app
  .version(require('./package.json').version)
  .option('-l, --log', 'Edit or append a log file (default mode)')
  .option('-d, --daily', 'Edit or append a daily todo file')
  .option('-c, --custom [name]', 'Edit or append a custom file')
  .option('-n, --filename', 'Don\'t do anything, just output full filename')
  .option('-y, --yesterday', 'shift time in question to yesterday')
  .option('-t, --transform', 'transform input into csv')
  .parse(process.argv)

if (app.transform) {
  const fs = require("fs")
  const data = fs
    .readFileSync("/dev/stdin", "utf-8")
    .split('\n')
    .map(
      line => line
        .trim()
        .replace(/^\-\s/, '')
        .trim()
    )
    .filter(line => line)
    .forEach(line => {
      const timeMatch = line.match(/^([^,]+),(.*)$/)
      if (timeMatch) {
        let time = timeMatch[1]
        const dateMatch = time.match(/\d+\-\d+\-\d+/)
        if (dateMatch) {
          time = dateMatch[0]
        }

        const clean = timeMatch[2].replace(/%\w+/g, '').trim()
        const durationMatch = clean.match(/([\d.]+)([mh])/)
        const duration = durationMatch ?
          (durationMatch[2] === 'm' ? (parseFloat(durationMatch[1]) / 60) : durationMatch[1])
          : 'ERROR'
        console.log(time + '\t' + duration + '\t' + clean.replace(/[\d.]+[mh]/, '').trim())
      } else {
        console.log('ERROR\tERROR\t' + line)
      }
    })

  process.exit()
}

const mode = app.daily ? 'daily'
  : app.custom ? 'custom'
    : 'log'

let filename
let path
let now

if (app.custom) {
  let customName = app.custom
  path = `${repoPath}/${mode}`
  const filePath = customName.match(/^(.+)\/([^/]+)$/)
  if (filePath) {
    path += '/' + filePath[1]
    customName = filePath[2]
  }
  filename = `${path}/${customName}.md`
} else {
  now = moment(new Date())
  if (app.yesterday) {
    now = now.subtract(1, 'days')
  }
  path = `${repoPath}/${mode}/` + now.format('YYYY/MM')
  filename = path + now.format('/DD') + '.md'
}

if (app.filename) {
  console.log(filename)
  process.exit()
}

mkdirp.sync(path)

if (!app.args.length) {
  const editor = process.env.EDITOR || 'vi'
  console.log(`editing file: ${filename}`)
  spawn(editor, [filename], { stdio: 'inherit' })
} else {
  let message = '- '
  if (mode === 'log') {
    message += now.format('YYYY-MM-DD[T]HH:mm:ss[, ]')
  }
  message += app.args.join(' ') + '\n'
  fs.appendFileSync(filename, message)
  console.log(`appended to: ${filename}`)
}

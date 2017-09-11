#!/usr/bin/env node
const fs = require('fs')
const {spawn} = require('child_process')
const moment = require('moment')
const app = require('commander')
const mkdirp = require('mkdirp')

const repoPath = process.env.HOME + '/projects/polog-data'
fs.accessSync(repoPath)

app
  .version(require('./package.json').version)
  .option('-t, --tag [tag]', 'Task, default: text')
  .parse(process.argv)

const type = app.tag || 'text'
const now = moment(new Date())
const path = repoPath + now.format('/YYYY/MM')
mkdirp.sync(path)
const filename = path + now.format('/DD[.txt]')

if (!app.args.length && type === 'text') {
  const editor = process.env.EDITOR || 'vi'
  spawn(editor, [filename], {stdio: 'inherit'})
} else {
  const message = now.format('YYYY-MM-DD[T]HH:mm:ss') +
    ', #' + type +
    (app.args.length ? ', ' + app.args.join(' ') : '') +
    '\n'
  fs.appendFileSync(filename, message)
}

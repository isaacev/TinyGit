#! /usr/bin/env node

import * as program from 'commander'

import * as plumbing from './plumbing'

program
  .version(require('../package.json').version)

program
  .command('hash-object')
  .option('--write', 'writes blob to file', true)
  .arguments('<file>')
  .action(errHandler((file, options) => {
    const id = plumbing.hashObject(file, options.write === true)
    console.log(id.toString())
  }))

program
  .command('cat-file')
  .arguments('<object>')
  .action(errHandler(prefix => {
    console.log(plumbing.catFile(prefix))
  }))

program.parse(process.argv)

function errHandler (action) {
  return (...argv) => {
    try {
      action.apply(action, argv)
    } catch (err) {
      console.error(err.message)
    }
  }
}

#! /usr/bin/env node

import { format as fmt } from 'util'
import * as program from 'commander'

import * as plumbing from './plumbing'
import * as porcelain from './porcelain'
import { ID } from './models/object'

program
  .version(require('../package.json').version)

program
  .command('init')
  .action(errHandler(() => {
    porcelain.init()
  }))

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

program
  .command('ls-files')
  .action(errHandler(() => {
    console.log(plumbing.lsFiles())
  }))

program
  .command('update-index')
  .option('--add <object>', 'if file not in index, add it to the index')
  .option('--remove', 'if file is in index, remove it from the index')
  .arguments('<path>')
  .action(errHandler((path, options={add: false, remove: false}) => {
    if (typeof options.add === 'string') {
      plumbing.addToIndex(new ID(options.add), path)
    } else if (options.remove === true) {
      plumbing.removeFromIndex(path)
    }
  }))

program
  .command('write-tree')
  .option('--prefix <prefix>')
  .action(errHandler((options={prefix: ''}) => {
    const id = plumbing.writeTree(options.prefix || '')
    console.log(id.toString())
  }))

program
  .command('commit-tree')
  .option('--parents <parents>')
  .option('--author <author>')
  .option('--message <message>')
  .arguments('<tree>')
  .action(errHandler((tree, options ) => {
    let parents: ID[] = []
    if (options.parents) {
      parents = options.parents.split(',').map(p => new ID(p))
    }

    let author: string = null
    if (options.author) {
      author = options.author
    }

    let message: string = null
    if (options.message) {
      message = options.message
    }

    const treeID = new ID(tree)
    const id = plumbing.commitTree(treeID, parents, author, message)
    console.log(id.toString())
  }))

program
  .command('update-ref')
  .arguments('<name> <pointer>')
  .action(errHandler((name, pointer) => {
    plumbing.updateRef(name, new ID(pointer))
  }))

program
  .command('show-ref')
  .action(errHandler(() => {
    plumbing.showRef().forEach(ref => {
      console.log(fmt('%s %s', ref.pointer, ref.name))
    })
  }))

program
  .command('diff-index')
  .arguments('<tree>')
  .action(errHandler(tree => {
    plumbing.diffIndex(new ID(tree)).forEach(diff => {
      console.log(fmt('%s %s %s', diff.before, diff.after, diff.name))
    })
  }))

program
  .command('add')
  .arguments('<filepath>')
  .action(errHandler(filepath => {
    porcelain.add(filepath)
  }))

program
  .command('commit')
  .option('--author <author>')
  .option('--message <message>')
  .action(errHandler((options) => {
    let author: string = null
    if (options.author) {
      author = options.author
    }

    let message: string = null
    if (options.message) {
      message = options.message
    }

    porcelain.commit(author, message)
  }))

program
  .command('status')
  .action(errHandler(() => {
    porcelain.status().forEach(diff => {
      console.log(fmt('%s %s', diff.status[0].toUpperCase(), diff.name))
    })
  }))

program
  .command('log')
  .action(() => {
    porcelain.log().forEach(commit => {
      console.log(fmt('%s (%s) %s', commit.id(), commit.author(), commit.message()))
    })
  })

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

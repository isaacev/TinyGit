import * as program from 'commander'
import * as util from './util'
import * as commands from './commands'
import { ObjectID } from './object-id'

import { init } from './command-init'
import { hashObject } from './command-hash-object'
import { catFile, CatFileMode } from './command-cat-file'
import { lsFiles } from './command-ls-files'
import { updateIndex, UpdateIndexMode } from './command-update-index'
import { status as importedStatusSync } from './command-status'
import { log } from './command-log'

program
  .version('0.2.0')

program
  .command('init')
  .action((options = {}) => {
    init()
  })

program
  .command('hash-object')
  .arguments('<path>')
  .option('--write')
  .action((path, options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    const write = (options.write === true)
    const id    = hashObject(path, write)
    console.log(id.toString())
  })

program
  .command('cat-file')
  .arguments('<object>')
  .option('--type')
  .option('--size')
  .option('--exit')
  .option('--print')
  .action((object, options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    const showType   = (options.type === true)
    const showSize   = (options.size === true)
    const showPretty = (options.print === true)
    const exit       = (options.exit === true)

    if (util.onlyOneIsTrue(showType, showSize, showPretty, exit)) {
      const id = util.mapStringToObjectID(object)
      const mode =
          (showType)   ? CatFileMode.Type :
          (showSize)   ? CatFileMode.Size :
          (showPretty) ? CatFileMode.Pretty :
                         CatFileMode.Exit

      console.log(catFile(id, mode))
    } else {
      options.help()
    }
  })

program
  .command('ls-files')
  .action(() => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    console.log(lsFiles())
  })

program
  .command('update-index')
  .arguments('<path>')
  .option('--add <object>')
  .option('--remove')
  .action((name, options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    const hasAdd    = typeof options.add === 'string'
    const hasRemove = options.remove === true

    if (hasAdd && hasRemove === false) {
      const id   = util.mapStringToObjectID(options.add)
      const mode = UpdateIndexMode.Add
      updateIndex(id, name, mode)
    } else if (hasAdd === false && hasRemove) {
      const mode = UpdateIndexMode.Remove
      updateIndex(null, name, mode)
    } else {
      options.help()
    }
  })

program
  .command('write-tree')
  .option('--prefix <prefix>')
  .option('--missing-ok')
  .action((options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    const prefix    = (typeof options.prefix !== 'string') ? '' : options.prefix
    const missingOk = (options.missingOk === true)
    console.log(commands.writeTreeSync(prefix, missingOk).toString())
  })

program
  .command('add')
  .arguments('<path>')
  .action((path, options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    const id   = hashObject(path, true)
    const mode = UpdateIndexMode.Add
    updateIndex(id, path, mode)
  })

program
  .command('reset')
  .arguments('<path>')
  .action((path, options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    const mode = UpdateIndexMode.Remove
    updateIndex(null, path, mode)
  })

program
  .command('commit-tree')
  .arguments('<tree>')
  .option('--parent <list>')
  .option('--author <author>')
  .option('--message <message>')
  .action((tree, options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    const id         = util.mapStringToObjectID(tree)
    const hasParents = (typeof options.parent === 'string')
    const hasAuthor  = (typeof options.author === 'string')
    const hasMessage = (typeof options.message === 'string')

    if (hasAuthor && hasMessage) {
      const parents = ((hasParents) ? options.parent.split(',') : []).map((arg) => {
        return util.mapStringToObjectID(arg)
      }) as ObjectID[]
      const author  = options.author
      const message = options.message

      const commitId = commands.commitTreeSync(id, parents, author, message)
      console.log(commitId.toString())
    } else {
      options.help()
    }
  })

program
  .command('commit')
  .option('--author <author>')
  .option('--message <message>')
  .action((options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    const hasAuthor  = (typeof options.author === 'string')
    const hasMessage = (typeof options.message === 'string')

    if (hasAuthor && hasMessage) {
      const author  = options.author
      const message = options.message

      const commitId = commands.commitSync(author, message)
      console.log(commitId.toString())
    } else {
      options.help()
    }
  })

program
  .command('status')
  .action((options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    process.stdout.write(importedStatusSync())
  })

program
  .command('log')
  .action((options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    console.log(log())
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.help()
}

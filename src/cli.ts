import * as program from 'commander'
import * as util from './util'
import * as commands from './commands'
import { ObjectID } from './object-id'

program
  .version('0.2.0')

program
  .command('init')
  .action(commands.init.bind(null, (err) => {
    if (err) {
      console.error(err.message)
    }
  }))

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
    const id    = commands.hashObjectSync(path, write)
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
          (showType)   ? commands.CatFileMode.Type :
          (showSize)   ? commands.CatFileMode.Size :
          (showPretty) ? commands.CatFileMode.Pretty :
                         commands.CatFileMode.Exit

      console.log(commands.catFileSync(id, mode))
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

    console.log(commands.lsFilesSync())
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
      const mode = commands.UpdateIndexMode.Add
      commands.updateIndexSync(id, name, mode)
    } else if (hasAdd === false && hasRemove) {
      const mode = commands.UpdateIndexMode.Remove
      commands.updateIndexSync(null, name, mode)
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

    const id   = commands.hashObjectSync(path, true)
    const mode = commands.UpdateIndexMode.Add
    commands.updateIndexSync(id, path, mode)
  })

program
  .command('reset')
  .arguments('<path>')
  .action((path, options = {}) => {
    if (util.repoDoesNotExist()) {
      console.error('directory not a TinyGit repository')
      return
    }

    const mode = commands.UpdateIndexMode.Remove
    commands.updateIndexSync(null, path, mode)
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

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.help()
}

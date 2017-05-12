import * as program from 'commander'
import * as util from './util'
import * as commands from './commands'

program
  .version('0.1.0')

program
  .command('init')
  .action(commands.init.bind(null, (err) => {
    if (err) {
      console.error(err.message)
    }
  }))

program
  .command('hash-object')
  .option('--write')
  .arguments('<file>')
  .action((filename, options) => {
    const write = (options.write === true)
    const hash = commands.hashObjectSync(filename, write)
    console.log(hash)
  })

program
  .command('cat-file')
  .option('--type')
  .option('--size')
  .option('--exit')
  .option('--print')
  .arguments('<object>')
  .action((hash, options) => {
    const showType   = (options.type === true)
    const showSize   = (options.size === true)
    const showPretty = (options.print === true)
    const exit       = (options.exit === true)

    if (util.onlyOneIsTrue(showType, showSize, showPretty, exit)) {
      hash = util.mapShortHashToFullHashSync(hash)

      let mode: commands.CatFileMode

      if (showType) {
        mode = commands.CatFileMode.Type
      } else if (showSize) {
        mode = commands.CatFileMode.Size
      } else if (showPretty) {
        mode = commands.CatFileMode.Pretty
      } else {
        mode = commands.CatFileMode.Exit
      }

      const output = commands.catFileSync(hash, mode)
      console.log(output)
    } else {
      options.help()
    }
  })

program
  .command('ls-files')
  .action(() => {
    const output = commands.lsFilesSync()
    console.log(output)
  })

program
  .command('update-index')
  .option('--add <object>')
  .option('--remove')
  .arguments('<path>')
  .action((name, options) => {
    const addIsMissing    = options.add === undefined
    const removeIsMissing = options.remove === undefined

    if (util.isLegalHash(options.add || '') && removeIsMissing) {
      const hash = util.mapShortHashToFullHashSync(options.add)
      const mode = commands.UpdateIndexMode.Add
      commands.updateIndexSync(hash, name, mode)
    } else if (addIsMissing && options.remove === true) {
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
  .action((options) => {
    const prefix    = (typeof options.prefix !== 'string') ? '' : options.prefix
    const missingOk = (options.missingOk === true)
    const hash      = commands.writeTreeSync(prefix, missingOk)
    console.log(hash)
  })

program
  .command('add')
  .arguments('<path>')
  .action((path, options) => {
    const hash = commands.hashObjectSync(path, true)
    const mode = commands.UpdateIndexMode.Add
    commands.updateIndexSync(hash, path, mode)
  })

program
  .command('reset')
  .arguments('<path>')
  .action((path, options) => {
    const mode = commands.UpdateIndexMode.Remove
    commands.updateIndexSync(null, path, mode)
  })

program
  .command('commit-tree')
  .arguments('<object>')
  .option('--parent <list>')
  .option('--author <author>')
  .option('--message <message>')
  .action((hash, options) => {
    const tree       = util.mapShortHashToFullHashSync(hash)
    const hasParents = (typeof options.parent === 'string')
    const hasAuthor  = (typeof options.author === 'string')
    const hasMessage = (typeof options.message === 'string')

    if (hasAuthor && hasMessage) {
      const parents = ((hasParents) ? options.parent.split(',') : []) as string[]
      const author  = options.author
      const message = options.message

      const commitId = commands.commitTreeSync(tree, parents, author, message)
      console.log(commitId)
    } else {
      options.help()
    }
  })

program.parse(process.argv)

import * as program from 'commander'
import * as util from './util'
import * as commands from './commands'

program
  .version('0.1.0')

program
  .command('init')
  .description('Create an empty TinyGit repository')
  .action(commands.init.bind(null, (err) => {
    if (err) {
      console.error(err.message)
    }
  }))

program
  .command('hash-object')
  .description('Compute an object ID and optionally create a blob from a file')
  .option('--write', 'Write the object into the object database')
  .arguments('<file>')
  .action((filename, options) => {
    commands.hashObject(filename, options.write === true, (err, hash) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log(hash)
      }
    })
  })

program
  .command('cat-file')
  .option('--type', 'Instead of the content, show the object type')
  .option('--size', 'Instead of the content, show the object size')
  .option('--exit', 'Suppress all output; instead exist with zero status if <object> exists and is a valid object')
  .option('--print', 'Pretty-print the contents of <object> based on its type')
  .arguments('<object>')
  .action((hash, options) => {
    let showType   = (options.type === true)
    let showSize   = (options.size === true)
    let showPretty = (options.print === true)
    let exit       = (options.exit === true)

    if (util.onlyOneIsTrue(showType, showSize, showPretty, exit)) {
      util.mapShortHashToFullHash(hash, (err, hash) => {
        if (err) {
          console.error(err.message)
        } else {
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

          commands.catFile(hash, mode, (err, output) => {
            if (err) {
              console.error(err.message)
            } else {
              console.log(output)
            }
          })
        }
      })
    } else {
      options.help()
    }
  })

program
  .command('ls-files')
  .action(commands.lsFiles.bind(null, (err, output) => {
    if (err) {
      console.error(err.message)
    } else {
      console.log(output)
    }
  }))

program
  .command('update-index')
  .option('--add <object>')
  .option('--remove')
  .arguments('<path>')
  .action((name, options) => {
    let addIsMissing    = options.add === undefined
    let removeIsMissing = options.remove === undefined

    if (util.isLegalHash(options.add || '') && removeIsMissing) {
      util.mapShortHashToFullHash(options.add, (err, hash) => {
        if (err) {
          console.error(err.message)
        } else {
          let mode = commands.UpdateIndexMode.Add

          commands.updateIndex(hash, name, mode, (err) => {
            if (err) {
              console.error(err.message)
            }
          })
        }
      })
    } else if (addIsMissing && options.remove === true) {
      let mode = commands.UpdateIndexMode.Remove
      commands.updateIndex(null, name, mode, (err) => {
        if (err) {
          console.error(err.message)
        }
      })
    } else {
      options.help()
    }
  })

program
  .command('write-tree')
  .option('--prefix <prefix>')
  .option('--missing-ok')
  .action((options) => {
    let prefix = (typeof options.prefix !== 'string') ? '' : options.prefix
    let missingOk = (options.missingOk === true)

    commands.writeTree(prefix, missingOk, (err, hash) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log(hash)
      }
    })
  })

program.parse(process.argv)

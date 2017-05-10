import * as program from 'commander'
import * as commands from './commands'

program
  .version('0.1.0')

program
  .command('init')
  .description('Create an empty TinyGit repository')
  .action(commands.init)

program
  .command('hash-object')
  .description('Compute an object ID and optionally create a blob from a file')
  .option('--write', 'Write the object into the object database')
  .arguments('<file>')
  .action(commands.hashObject)

program
  .command('cat-file')
  .option('--type', 'Instead of the content, show the object type')
  .option('--size', 'Instead of the content, show the object size')
  .option('--exit', 'Suppress all output; instead exist with zero status if <object> exists and is a valid object')
  .option('--print', 'Pretty-print the contents of <object> based on its type')
  .arguments('<object>')
  .action(commands.catFile)

program.parse(process.argv)

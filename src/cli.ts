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

program.parse(process.argv)

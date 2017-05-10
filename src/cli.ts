import * as program from 'commander'
import * as commands from './commands'

program
  .version('0.1.0')

program
  .command('init')
  .description('Create an empty TinyGit repository')
  .action(commands.init)

program.parse(process.argv)

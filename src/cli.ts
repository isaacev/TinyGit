function version () {
  const pkg = require('../package.json')
  console.log(pkg.version)
}

version()

const Mocha = require('mocha')

const runner = new Mocha({})

runner.addFile('./tests.js')

runner.run(failures => {
  if (failures) {
    console.error(failures)
  } else {
    console.log('All passed.')
  }
})

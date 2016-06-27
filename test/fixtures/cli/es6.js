'use strict'

let probe = () => {
  let missed = () => {
    console.log('do not hit')
  }
}

let b = () => {
  console.log('hit this method')
}

module.exports = () => {
  console.log('do not hit')
}

b()

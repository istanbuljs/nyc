'use strict'

class Yarsay {
  constructor() {
    console.log('sup')
  }

  hit() {
    console.log('do not hit')
    let miss = () => {
      console.log('do not hit')
    }
  }

  miss() {
    let miss = () => {
      console.log('do not hit')
    }
  }
}

let y = new Yarsay()
y.hit()

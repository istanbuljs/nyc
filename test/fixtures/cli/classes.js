'use strict'

class Funclass {
  hit() {
    const miss = () => {
      console.log('This is intentionally uncovered');
    }
  }

  skip() {
    console.log('this will be skipped');
  }
}

new Funclass().hit();

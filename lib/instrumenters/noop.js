function NOOP () {
  return {
    instrumentSync: function (code) {
      return code
    }
  }
}

module.exports = NOOP

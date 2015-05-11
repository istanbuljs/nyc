function A () {

}

A.prototype.f1 = function () {
  this.f2()
}

A.prototype.f2 = function () {
  this.value = 99
}

;(new A()).f2()

module.exports = A

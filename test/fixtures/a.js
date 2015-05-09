function A () {

}

A.prototype.f1 = function () {
  this.hit2()
}

A.prototype.f2 = function () {
  this.value = 99
}

A.prototype.f3 = function () {

}

module.exports = A

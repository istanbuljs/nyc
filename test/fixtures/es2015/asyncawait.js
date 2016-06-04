const foo = async (opts, opts2) => {
  let snuh = await bar()
}

const bar = () => {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve(33)
    }, 10)
  })
}

foo()

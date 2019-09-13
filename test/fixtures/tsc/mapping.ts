function munge1 (obj: Object) {
  return {
    name: 'munge1',
    ...obj
  };
}

munge1({})

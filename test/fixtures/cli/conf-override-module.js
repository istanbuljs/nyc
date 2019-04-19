const config = JSON.parse(process.env.NYC_CONFIG)
console.log('in module', {include: config.include})

var Push = require( 'pushover-notifications' )

var p = new Push( {
  user: process.env.PUSH_USER,
  token: process.env.PUSH_TOKEN,
})

module.exports = async (message, errorLevel) => {
  const promise = new Promise(function(resolve, reject) {
	   var msg = {message: `EL Stock Update -  ${message}`,
                priority: errorLevel,
                }

     p.send(msg, (err, result) => {
  	    if ( err ) {
          reject(err)
        }
        resolve(result)
      })
    })
  return promise
}

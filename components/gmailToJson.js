var imaps = require('imap-simple');
const csvtojson = require("csvtojson/v2");


var config = {
    imap: {
      user: process.env.MAIL_USERNAME,
      password: process.env.MAIL_PW,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
};

getTodaysEmail = async () => {
  //make connection
  let connection = await imaps.connect(config)
  //open the stock updates folder
  await connection.openBox('StockUpdates')
  //create today's date
  let today = new Date().toDateString()
  // search for all emails from today
  var searchCriteria = [ 'ALL', ['ON', today] ];
  // define what to return
  var fetchOptions = {bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], struct: true, markSeen: true};
  //return array of emails from today
  let arrayOfMessages = await connection.search(searchCriteria, fetchOptions)

  var attachments = [];

  //discard everything but the first email
  const message = arrayOfMessages.shift();

  // get parts of the email
  var parts = await imaps.getParts(message.attributes.struct);

  //Get only parts of the email that have attachements and are csvs
  let partData =  await attachments.concat(parts.filter(part => part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT' && part.params.name.endsWith('.csv')))

  // download the attachement
  let csv = await connection.getPartData(message, partData[0])

  //close the connection with the imap server
  connection.end();

  //return the csv
  return csv
}

csvToJson = async (csvBuffer) => {
  let jsonArray = await csvtojson({
    noheader: true,
    headers: ['blank','sku', 'description', 'stockDescription', 'quantity', 'nextDeliveryDate', 'barcode', 'comment' ]
  }).fromString(csvBuffer.toString('utf8'),

  )
  jsonArray.splice(0,3)
  console.log(`${jsonArray.length} Europa Leisure products in csv from gmail`)

  return jsonArray
}



module.exports = async () => {
  let csv = await getTodaysEmail()
  let data = await csvToJson(csv)
  if (data.length < 30 || data == null) {
    throw new Error('Issue with csv')
  } else {
    return data
  }

}

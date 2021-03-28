var imaps = require('imap-simple');
const csvtojson = require("csvtojson/v2");

var {
  google
} = require("googleapis");
let privatekey = require("../credentials.json");


// configure a JWT auth client
const createJwtAuth = async () => {
  let jwtClient = await new google.auth.JWT(
    privatekey.client_email,
    null,
    privatekey.private_key,
    ['https://mail.google.com/'],
    "sales@rubys-garden-boutique.co.uk"
  );
  //authenticate request
  await jwtClient.authorize((err, tokens) => {
    if (err) {
      throw err
    } else {
      console.log("Successfully connected!");
    }
  });
  return jwtClient
}


const downloadCsvFromGmail = async () => {
  try {
    let jwt = await createJwtAuth()

    const gmail = google.gmail({version: 'v1',jwt});
    //Get the newest email back from the stock updates folder
    let mostRecentStockUpdateEmail = await gmail.users.messages.list({auth: jwt,userId: 'me', q: "label:stockupdates", maxResults: 1})
    // Get back the parts of the email
    let stockUpdateEmail = await gmail.users.messages.get({auth: jwt,userId: 'me', id: mostRecentStockUpdateEmail.data.messages[0].id})
    // Get the attachement with the csv
    const result = await stockUpdateEmail.data.payload.parts.find( part => part.filename.endsWith(".csv"));
    /// Download the base64 csv
    let csvObject = await gmail.users.messages.attachments.get({auth: jwt,userId: 'me', id: result.body.attachmentId, messageId: mostRecentStockUpdateEmail.data.messages[0].id})
    // Convert the base64 csv to utf-8
    let csv = await Buffer.from(csvObject.data.data, 'base64').toString('utf8')

    const emailReceivedDateAsInt = parseInt(stockUpdateEmail.data.internalDate)
    let stringForPushMessage = `Using the email that was received on ${new Date(emailReceivedDateAsInt).toDateString()}`
    console.log(stringForPushMessage);


    return [csv, stringForPushMessage]
  } catch (e) {
    console.log(e);
  }
}

csvToJson = async (csvString) => {
  let jsonArray = await csvtojson({
    noheader: true,
    headers: ['blank','sku', 'description', 'stockDescription', 'quantity', 'nextDeliveryDate', 'barcode', 'comment' ]
  }).fromString(csvString)
  jsonArray.splice(0,3)
  console.log(`${jsonArray.length} Europa Leisure products in csv from gmail`)
  return jsonArray
}

module.exports = async () => {
  let [csv, stringForPushMessage] = await downloadCsvFromGmail()
  let data = await csvToJson(csv)
  if (data.length < 30 || data == null) {
    throw new Error('Issue with csv')
  } else {
    return [data, stringForPushMessage]
  }
}

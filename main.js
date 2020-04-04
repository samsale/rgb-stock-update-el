const dotenv = require('dotenv').config()
const downloadShopifyProducts = require('./components/downloadShopifyProducts');
const gmailToJson = require('./components/gmailToJson');
const checkWhatIsInStore = require('./components/sortProducts');
const updateStock = require('./components/updateStock');
const checkWhatIsInStoreButNoInCSV = require('./components/checkWhatIsInStoreButNoInCSV');
const updateProductThatIsNotInCsv = require('./components/updateProductThatIsNotInCsv');
const sendPushMessage = require('./components/sendPushMessage');

const index = async () => {
  try{
    let stockUpdateArray = await gmailToJson()
    let productsArray = await downloadShopifyProducts()
    let productsNotInCsvArray = await checkWhatIsInStoreButNoInCSV(stockUpdateArray, productsArray)
    await updateProductThatIsNotInCsv(productsNotInCsvArray)
    let shopifyUpdateArray = await checkWhatIsInStore(stockUpdateArray, productsArray)
    await updateStock(shopifyUpdateArray)
    await sendPushMessage()
  }
  catch(err){
     sendPushMessage(err.name)
     console.log(err);
  }
}

index();

function compareSkus(array, newSku) {
  return array.find(object => object.sku === newSku);
}

module.exports =  async (stockUpdateArray, inStoreArray) =>{
  let notInStoreArray = []
  let alreadyInStoreArray = []
  for(let value of stockUpdateArray){
    if(compareSkus(inStoreArray, value.sku) === undefined ){
      notInStoreArray.push(value)
    }else{
      let objWithProductId = inStoreArray.find(obj => obj.sku === value.sku);
      value["inventory_item_id"] = objWithProductId.inventory_item_id
      value["variant_id"] = objWithProductId.id

      alreadyInStoreArray.push(value)
    }
  }
  await console.log(`${alreadyInStoreArray.length} products to update`);
  let discountinued = notInStoreArray.filter(product => product.comment === "DISCONTINUED")
  let notDiscountinued = notInStoreArray.filter(product => product.comment !== "DISCONTINUED")
  await console.log(`${notInStoreArray.length} are in the csv but not in store. ${discountinued.length} of those are disconituned`);
  await console.log(`The others that are not discontinued are:`)
  for (var variable of notDiscountinued) {
    console.log(variable.sku);
  }  
  return alreadyInStoreArray
}

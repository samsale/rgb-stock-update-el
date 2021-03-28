const Shopify = require('shopify-api-node');

// create shopify store object
const shopify = new Shopify({
  shopName: process.env.SHOPIFY_NAME,
  apiKey: process.env.SHOPIFY_API_KEY,
  password: process.env.SHOPIFY_PASSWORD,
  autoLimit: { calls: 2, interval: 5000, bucketSize: 35 },
  timeout: 180000, //six minutes
  apiVersion: '2019-10'
});


module.exports = async function() {
  let params = { limit: 250 };
  let allTempProducts = []
  do {
    const products = await shopify.product.list(params);
    allTempProducts.push(products)

    params = products.nextPageParameters;
  } while (params !== undefined);
  const allProducts = [].concat.apply([], allTempProducts);

  let variants = allProducts.flatMap(product => product.variants)
  console.log(`${variants.length} variants downloaded from store`);  
return variants
}

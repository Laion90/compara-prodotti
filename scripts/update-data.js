import fetch from 'node-fetch';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import 'dotenv/config';
const advertiserIds = '106601';                  //  ← il tuo ID
const url = `https://api.awin.com/products?accessToken=${process.env.AWIN_TOKEN}&advertiserIds=${advertiserIds}`;
const csv = await (await fetch(url)).text();

const prodotti = parse(csv, { columns: true })
  .filter(r => r.category?.toLowerCase().includes('hosting'))
  .map(r => ({
    slug: r.productId,
    brand: r.merchantName,
    nome: r.productName,
    prezzo: r.searchPrice,
    link_aff: r.productUrl
}));

fs.mkdirSync('data', { recursive: true });
fs.writeFileSync('data/prodotti.json', JSON.stringify(prodotti, null, 2));
console.log('Prodotti salvati:', prodotti.length);

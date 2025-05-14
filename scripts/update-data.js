// scripts/update-data.js
import fetch from 'node-fetch';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import 'dotenv/config';

/* ============== 1. PARAMETRI DA MODIFICARE SOLO QUI ============== */
const advertiserIds = '67702';           // <<—  metti l’ID (o più ID separati da ,)
/* ================================================================= */

/* 2. OTTIENI UN access_token OAuth2 (client_credentials) */
async function getAccessToken() {
  const res = await fetch('https://api.awin.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AWIN_CLIENT_ID,
      client_secret: process.env.AWIN_CLIENT_SECRET
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`OAuth2 error: ${res.status} – ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

/* 3. SCARICA IL CSV DAL PRODUCT FEED */
async function getCsv(accessToken) {
  const url = `https://api.awin.com/products?advertiserIds=${advertiserIds}&format=csv`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const text = await res.text();
  if (!res.ok || text.trim().startsWith('{')) {
    throw new Error(`ProductServe error: ${res.status} – ${text}`);
  }
  return text;
}

/* 4. MAIN */
(async () => {
  try {
    const token = await getAccessToken();
    const csv = await getCsv(token);

    const prodotti = parse(csv, { columns: true })
      // ▼ togli o modifica il filtro se non cerchi solo 'hosting'
      .filter(r => r.category?.toLowerCase().includes('hosting'))
      .map(r => ({
        slug:  r.productId,               // puoi cambiare lo slug se vuoi
        brand: r.merchantName,
        nome:  r.productName,
        prezzo:r.searchPrice,
        link_aff: r.productUrl
      }));

    fs.mkdirSync('data', { recursive: true });
    fs.writeFileSync('data/prodotti.json', JSON.stringify(prodotti, null, 2));
    console.log('Prodotti salvati:', prodotti.length);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();

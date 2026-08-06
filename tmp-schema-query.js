const https = require('https');
const url = 'https://ccybmzelitxzpvuaszph.supabase.co/rest/v1/information_schema.columns?select=table_name,column_name,data_type&table_schema=eq.public&table_name=in.(expenses,incomes,budgets,recurring_expenses,profile,app_settings)&order=table_name.asc,ordinal_position.asc';
const req = https.request(url, {
  method: 'GET',
  headers: {
    'apikey': 'sb_publishable_LpgoPSUkASgJ4v4EOt3EFQ_5E9QZlpb',
    'Authorization': 'Bearer sb_publishable_LpgoPSUkASgJ4v4EOt3EFQ_5E9QZlpb',
    'Accept': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(res.statusCode);
    console.log(data);
  });
});
req.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
req.end();

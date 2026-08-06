const https = require('https');
const url = 'https://ccybmzelitxzpvuaszph.supabase.co/rest/v1/rpc/exec_sql';
const sql = "select table_name, column_name, data_type from information_schema.columns where table_schema = 'public' and table_name in ('expenses','incomes','budgets','recurring_expenses','profile','app_settings') order by table_name, ordinal_position;";
const body = JSON.stringify({ sql });
const req = https.request(url, {
  method: 'POST',
  headers: {
    apikey: 'sb_publishable_LpgoPSUkASgJ4v4EOt3EFQ_5E9QZlpb',
    Authorization: 'Bearer sb_publishable_LpgoPSUkASgJ4v4EOt3EFQ_5E9QZlpb',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log(data);
  });
});
req.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
req.write(body);
req.end();

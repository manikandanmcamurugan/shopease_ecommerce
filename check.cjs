const fs = require('fs');
const https = require('https');
const http = require('http');

const content = fs.readFileSync('src/services/productService.js', 'utf8');
const urls = [...content.matchAll(/\"image\":\s*\"(http[^\"]+)\"/g)].map(m => m[1]);
const uniqueUrls = [...new Set(urls)];

async function checkUrl(url) {
  return new Promise((resolve) => {
    const req = (url.startsWith('https') ? https : http).get(url, (res) => {
      resolve({url, status: res.statusCode});
      res.resume();
    }).on('error', (e) => {
      resolve({url, status: 0, error: e.message});
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({url, status: 'timeout'});
    });
  });
}

async function run() {
  console.log('Checking ' + uniqueUrls.length + ' URLs...');
  for (let url of uniqueUrls) {
    const res = await checkUrl(url);
    if (res.status !== 200 && res.status !== 301 && res.status !== 302) {
      console.log('BROKEN: ' + url + ' (Status: ' + res.status + ')');
    }
  }
  console.log('Done checking URLs.');
}
run();

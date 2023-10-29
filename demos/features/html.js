/**
 * html
 * https://k6.io/docs/javascript-api/k6-html/parsehtml/
 * 
 * How to run
 * k6 run demos/features/html.js
 */
import { parseHTML } from 'k6/html';
import http from 'k6/http';

export default function () {
  const res = http.get('https://k6.io');
  const doc = parseHTML(res.body); // equivalent to res.html()
  const pageTitle = doc.find('head title').text();
  const langAttr = doc.find('html').attr('lang');
  console.log(`Page title: ${pageTitle}`);
  console.log(`Page attributes: ${langAttr}`);
}


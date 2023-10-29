/**
 * html
 * https://k6.io/docs/javascript-api/k6-html/parsehtml/
 * 
 * How to run
 * k6 run demos/features/html.js
 */
import { parseHTML } from 'k6/html';
import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  const res = http.get('https://k6.io');
  const doc = parseHTML(res.body); // equivalent to res.html()
  const pageTitle = doc.find('head title').text();
  const langAttr = doc.find('html').attr('lang');
  console.log(`Page title: ${pageTitle}`);
  console.log(`Page attributes: ${langAttr}`);

  const content = `
  <dl>
    <dt id="term-1">Value term 1</dt>
    <dt id="term-2">Value term 2</dt>
  </dl>
    `;
  const sel = parseHTML(content).find('dl').children(); // pole elementů

  const el1 = sel.get(0);
  const el2 = sel.get(1);

  console.log(el1.nodeName()); // dt
  console.log(el1.id()); // term-1
  console.log(el1.textContent()); // Value term 1

  console.log(el2.nodeName()); // dt
  console.log(el2.id()); // term-2
  console.log(el2.textContent()); // Value term 2

  sleep(1);
}


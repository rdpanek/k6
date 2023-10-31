/**
 * k6chaijs
 * https://k6.io/docs/javascript-api/jslib/k6chaijs/
 * 
 * How to run
 * k6 run demos/features/chaijs.js
 * 
 */
import http from 'k6/http';
import chai, { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js';


// délka hodnot interpolovaných proměnných zkrýcena na 20 znaků
chai.config.truncateVariableThreshold = 20;

// check message zkrácena na 300 znaků
chai.config.truncateMsgThreshold = 300;

// hodnoty proměnných nejsou interpolovány do check message
chai.config.aggregateChecks = false;

// když check selže, vypíše se zpráva
chai.config.logFailures = false;

export default function testSuite() {
  describe('Fetch a list of public crocodiles', () => {
    const response = http.get('https://test-api.k6.io/public/crocodiles');

    expect(response.status, 'response status').to.equal(200);
    expect(response).to.have.validJsonBody();
    let resExpected = expect(response.json().length, 'number of crocs').to.be.above(4);
    console.log(resExpected);
  });

  describe('Testing bad assertion.', () => {
    const response = http.get('https://test-api.k6.io/');
    // to have a length at least 500 got 11244
    expect(response.body).to.have.lengthOf.at.least(500);
  });

  // describe returns a boolean indicating whether all checks passed.
  const success1 = describe('Basic test', () => {
    expect(1, 'number one').to.equal(1);
  });
  console.log(success1); // true

  const success2 = describe('Another test', () => {
    throw 'Something entirely unexpected happened';
  });
  console.log(success2); // false

  const success3 = describe('Yet another test', () => {
    expect(false, 'my vaule').to.be.true();
  });
  console.log(success3); // false

  // chaining describe blocks. && is a short-circuiting operator, so the second describe block will not be executed if the first one fails.
  // pokud první describe selže, druhý se nevykoná
  describe('Basic test chaining', () => {
    expect(1, 'number one').to.equal(1);
  }) &&
  
  describe('Another test chaining', () => {
    throw 'Something entirely unexpected happened';
  }) &&

  describe('Yet another test chaining', () => {
    // the will not be executed because the prior block returned `false`
    response = http.get('https://test-api.k6.io/');
    expect(response.status, 'response status').to.equal(200);
  })

  // chaijs expect API
  // https://k6.io/docs/javascript-api/jslib/k6chaijs/expect/
  if (false) {
    describe('Basic test', () => {
      expect({ a: 1 }).to.not.have.property("b");
      expect(2).to.equal(2);
      expect({ a: 1 }).to.deep.equal({ a: 1 });
      expect({ a: { b: ["x", "y"] } }).to.have.nested.property("a.b[1]");
      expect({ a: 1 }).to.have.own.property("a");
      expect([1, 2])
        .to.have.ordered.members([1, 2])
        .but.not.have.ordered.members([2, 1]);
      expect({ a: 1, b: 2 }).to.not.have.any.keys("c", "d");
      expect({ a: 1, b: 2 }).to.have.all.keys("a", "b");
      expect("foo").to.be.a("string");
      expect([1, 2, 3]).to.be.an("array").that.includes(2);
      expect("foobar").to.include("foo");
      expect(1).to.equal(1);
      expect(true).to.be.true;
      expect(false).to.be.false;
      expect(null).to.be.null;
      expect(undefined).to.be.undefined;
      expect(NaN).to.be.NaN;
      expect(1).to.equal(1);
      expect([]).to.be.empty;
      expect({}).not.to.be.arguments;
      expect(1).to.equal(1);
      expect({ a: 1 }).to.eql({ a: 1 }).but.not.equal({ a: 1 });
      expect("foo").to.have.lengthOf(3);
      expect(2).to.equal(2);
      expect(1).to.equal(1);
      expect(2).to.be.at.most(3);
      expect(2).to.equal(2);
      expect({ a: 1 }).to.not.be.an.instanceof(Array);
      expect({ a: 1 }).to.have.property("a");
      expect([1, 2, 3]).to.have.lengthOf(3);
      expect("foobar").to.match(/^foo/);
      expect("foobar").to.have.string("bar");
      expect({ a: 1, b: 2 }).to.have.all.keys("a", "b");
      const badFn = function () {
        throw new TypeError("Illegal salmon!");
      };
      expect(badFn).to.throw();
      expect(1).to.satisfy(function (num) {
        return num > 0;
      });
      expect(1.5).to.equal(1.5);
      expect([1, 2, 3]).to.have.members([2, 1, 3]);
      expect("Today is sunny").to.contain.oneOf(["sunny", "cloudy"]);
      expect({ a: 1 }).to.be.extensible;
      expect(1).to.be.finite;
    });
  }
}

// const fs = require('fs') 
const chai = require("chai")
const chaiAsPromised = require("chai-as-promised");
const should = require("chai").should();
chai.use(chaiAsPromised);

const ipni = require('./main.js');
let params = {
      perPage: 100, 
      cursor: "*", 
    }

describe('#ipni.query(IPNI_URL, params.q={genus:___, species:___})', function() {
  beforeEach(function() {
    params = {
      perPage: 100, 
      cursor: "*", 
    }
  })
  
  it('should return >= 6 results for Stanhopea oculata', function() {
    params.q = {
      genus: 'Stanhopea',
      species: 'oculata'
    }
    return ipni.query(ipni.IPNI_URL, params).then((r)=>{
      r.should.be.an('array').with.lengthOf.at.least(6);
    }) 
  });
  // chai-as-promised version
  it('should return >= 4 results for Stanhopea tigrina', function() {
    params.q = {
      genus: 'Stanhopea',
      species: 'tigrina'
    }
    return ipni.query(ipni.IPNI_URL, params)
      .should.eventually.be.an('array').with.lengthOf.at.least(4);
  });

  it('should return 0 results for Stanhopea typo', function() {
    params.q = {
      genus: 'Stanhopea',
      species: 'typo'
    }
    return ipni.query(ipni.IPNI_URL, params)
      .should.eventually.be.an('array').with.lengthOf(0);
  });
})

describe('#ipni.query(IPNI_URL, params.q={"a plant name"})', function() {
  beforeEach(function() {
    params = {
      perPage: 100, 
      cursor: "*", 
    }
  })
  
  it('should return >= 6 results for Stanhopea oculata', function() {
    params.q = 'Stanhopea oculata'
    return ipni.query(ipni.IPNI_URL, params).then((r)=>{
      r.should.be.an('array').with.lengthOf.at.least(6);
    }) 
  });
  // chai-as-promised version
  it('should return >= 4 results for Stanhopea tigrina', function() {
    params.q = 'Stanhopea tigrina'
    return ipni.query(ipni.IPNI_URL, params)
      .should.eventually.be.an('array').with.lengthOf.at.least(4);
  });

  it('should return 0 results for Stanhopea typo', function() {
    params.q = 'Stanhopea typo'
    return ipni.query(ipni.IPNI_URL, params)
      .should.eventually.be.an('array').with.lengthOf(0);
  });
})


// console.log(r);
// fs.writeFile('Output.json', JSON.stringify(r), (err) => { 
      
//     // In case of a error throw err. 
//     if (err) throw err; 
// });
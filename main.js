const axios = require('axios');

const IPNI_URL = 'http://beta.ipni.org/api/1';
const POWO_URL = 'http://www.plantsoftheworldonline.org/api/2';
const KPL_URL = 'http://kewplantlist.org/api/v1';

// where q is the query and f is the filter options (optional)
const params = {
  perPage: 100, 
  cursor: "*",
};

function urlFormat(url, method, params) {
  if ( params.q ) {
    // %3D is '=' but we want %3A which is ':' so stringify and replace
    // to avoid default conversion with URLSearchParams
    params.q = JSON.stringify(params.q).replace(/\"|{|}/g,"");
  }
  if ( params.f ) {
    // TODO: implement filters
    params.f = "";
  }
  // console.log(params)
  let opt = new URLSearchParams(params);
  return url + '/' + method + '?' + opt;
}

const query = (baseUrl, params) => {
  return new Promise ((resolve, reject) => {
    let response = undefined;
    let results = [];
    
    sendQuery(baseUrl, params) // returns promise
    .then(res=>{
      if (res === undefined) resolve([]); // no results
      if (res !== undefined) {
        response = res;
        results = res.data.results; // first page of results
        params.cursor = res.data.cursor;
      }
      // get more results using cursor and recursive query calls
      sendRecursiveQuery(baseUrl, params, results)
      .then(res=>{
        resolve(res); // res === results is true
        })
      })
    .catch(err=>{
      console.log(err);
      reject(Error("It broke"));
    })
  })
}

// params will only be the 'urn' or the 'fqId' e.g. 
// urn:lsid:ipni.org:names:658592-1
// and optionally 'distribution' and/or 'descriptions'
// params = {fields': 'distribution,otherThing,___'}
// http://www.plantsoftheworldonline.org/api/2/taxon/urn:lsid:ipni.org:names:658592-1?fields=distribution
const lookup = (baseUrl, params, urn) => {
  return new Promise ((resolve, reject) => {
    let response = undefined;
    params = 'fields='+ params;
    let url = urlFormat(baseUrl, 'taxon/'+urn, params)
    console.log(url);
    return axios.get(url) // returns promise
    .then(res=>{
      if (res === undefined) resolve([]); // no results
      if (res !== undefined) {
        resolve(res.data) // res === results is true
        // params.cursor = res.data.cursor;
      }
    })
    .catch(err=>{
      reject(Error("It broke"));
    });
  })
}

const sendQuery = (baseUrl, params) => {
  let method = 'search';
  let url = urlFormat(baseUrl, method, params);
  // console.log(url);
  return axios.get(url) // return a promise
  .then(res=>{
    if (res.data.status === 249) {
      console.error("too many requests");
      // too many requests, wait and try again
      // TODO: call query again after x seconds
      console.error(res.data.status);
    }
    if(res.data.results) {
      // console.log(res.data.results);
      // console.log("returning results");
      return(res);
    }
    else return undefined;
  })
  .catch(err=>{
    console.log("Error in sendQuery")
    console.log(err)
  })
}

const sendRecursiveQuery = (baseUrl, params, results) => {
  let method = 'search';
  let url = urlFormat(baseUrl, method, params);
  // console.log(url);
  return axios.get(url) // return a promise
  .then(res=>{
    if (res.data.status === 249) {
      console.error("too many requests");
      // too many requests, wait and try again
      // TODO: call query again after x seconds
      console.error(res.data.status);
    }
    if(res.data.results) {
      params.cursor = res.data.cursor;
      results.push(...res.data.results);
      return(sendRecursiveQuery(baseUrl, params, results));
    }
    else return results;
  })
  .catch(err=>{
    console.error("Error in sendRecursiveQuery")
    console.error(err)
  })
}

module.exports.IPNI_URL = IPNI_URL;
module.exports.POWO_URL = POWO_URL;
module.exports.KPL_URL = KPL_URL;
module.exports.query = query;
module.exports.lookup = lookup;
module.exports.params = params;
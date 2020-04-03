const axios = require('axios');

const IPNI_URL = 'http://beta.ipni.org/api/1';
const POWO_URL = 'http://www.plantsoftheworldonline.org/api/2';
const KPL_URL = 'http://kewplantlist.org/api/v1';

// where q is the query and f is the filter options (optional)
const params = {
  perPage: 100, 
  cursor: "*",
};

function urlFormat(url, params) {
  let method = 'search'; //only 'search' is a method so far
  if ( params.q ) {
    // %3D is '=' but we want %3A which is ':' so stringify and replace
    // to avoid default conversion with URLSearchParams
    params.q = JSON.stringify(params.q).replace(/\"|{|}/g,"");
  }
  if ( params.f ) {
    // TODO: implement filters
    params.f = "";
  }
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
        resolve(res) // res === results is true
        })
      })
    .catch(err=>{
      reject(Error("It broke"));
    })
  })
}

const sendQuery = (baseUrl, params) => {
  let url = urlFormat(baseUrl, params);
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
  let url = urlFormat(baseUrl, params);
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
module.exports.params = params;
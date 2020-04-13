const axios = require('axios');

const IPNI_URL = 'http://beta.ipni.org/api/1';
const POWO_URL = 'http://www.plantsoftheworldonline.org/api/2';
// const KPL_URL = 'http://kewplantlist.org/api/v1'; Untested

/* where property q is the query and property f (optional) specifies filter options */
const params = {
  perPage: 100, 
  cursor: "*",
};

/**@description Formats parameters passed to produce URL for querying with.
 * @param {string} url URL to add parameters to
 * @param {string} method 
 * @param {Object} params Query parameters
 * @return {string} 
 */
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
/**@description Send a query to baseUrl using recursion (optionally) to fetch more results
 * @param {string} baseUrl URL of DB to query, one of: IPNI_URL, POWO_URL
 * @param {Object} params Query parameters
 * @param {boolean} recursive Use recursion 
 * @return {string} Query results
 */
const query = (baseUrl, params, recursive) => {
  return new Promise ((resolve, reject) => {
    let response = undefined;
    let results = [];
    
    sendQuery(baseUrl, params) // returns promise
    .then(res=>{
      if (res === undefined) resolve([]); // no results
      if (res !== undefined) {
        response = res;
        results = res.data.results; // first page of results
      }
      if (!recursive) resolve(results);
      // get more results using cursor and recursive query calls
      else {
        params.cursor = (res.data) ? res.data.cursor : "*";
        sendRecursiveQuery(baseUrl, params, results)
        .then(res=>resolve(res)) 
        .catch(err=>{
          reject(Error("Recursive querying failed" + err));
        })
      }
    })
    .catch(err=>{
      reject(Error("Querying failed" + err));
    })
  })
}
/*
params will only be the 'urn' or the 'fqId' e.g. 
urn:lsid:ipni.org:names:658592-1
and optionally 'distribution' and/or 'descriptions'
params = {fields': 'distribution,otherThing,___'}
http://www.plantsoftheworldonline.org/api/2/taxon/urn:lsid:ipni.org:names:658592-1?fields=distribution
*/
const lookup = (baseUrl, params, urn) => {
  return new Promise ((resolve, reject) => {
    let response = undefined;
    params = 'fields='+ params;
    let url = urlFormat(baseUrl, 'taxon/'+urn, params)
    return axios.get(url) // returns promise
    .then(res=>{
      if (res === undefined) resolve([]); // no results
      if (res !== undefined) {
        resolve(res.data)
        // params.cursor = res.data.cursor;
      }
    })
    .catch(err=>{
      reject(Error("Lookup failed " + err));
    });
  })
}

/**@description Sends a formatted query to the baseUrl passed
 * @param {string} baseUrl URL of DB to query, one of: IPNI_URL, POWO_URL
 * @param {Object} params Query parameters
 * @return {string} Query results
 */
const sendQuery = (baseUrl, params) => {
  let method = 'search';
  let url = urlFormat(baseUrl, method, params);
  return axios.get(url) // return a promise
  .then(res=>{
    if (res.status === 429) {
      console.error(res.statusText);
      console.error(res.status);
    }
    if(res.data.results) {
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
  return axios.get(url) // return a promise
  .then(res=>{
    if (res.status === 429) {
      console.error(res.statusText);
      console.error(res.status);
    }
    if(res.data.results) {
      params.cursor = res.data.cursor;
      results.push(...res.data.results);
      return(sendRecursiveQuery(baseUrl, params, results));
    }
    else return results;
  })
  .catch(err=>{
    console.error("Error in sendRecursiveQuery" + err)
  })
}

module.exports.IPNI_URL = IPNI_URL;
module.exports.POWO_URL = POWO_URL;
// module.exports.KPL_URL = KPL_URL;
module.exports.query = query;
module.exports.lookup = lookup;
module.exports.params = params;
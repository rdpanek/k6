import { parseHTML } from 'k6/html';

/*
  <img src="/img/logo.svg" class="">
*/
const getImages = function(doc) {
  let _resourcesArr = []
  let _resources = doc.find('img');
  _resources.map(function (idEl, _el) {
    if (_el.attr('src') !== undefined) {
      _resourcesArr.push(_el.attr('src'))
    }
  })
  return _resourcesArr
}

/*
  <link rel="stylesheet" href="/styles.ed0dae91.css">
  <link data-react-helmet="true" rel="shortcut icon" href="/img/favicon.ico">
  <link rel="preload" href="/styles.3e16c8f0.js" as="script">
*/
const getLinkResources = function(doc) {
  let _resourcesArr = []
  let _resources = doc.find('link');
  _resources.map(function (idEl, _el) {
    if (_el.attr('href') !== undefined) {
      _resourcesArr.push(_el.attr('href'))
    }
  })
  return _resourcesArr
}

/*
  <script src="/styles.3e16c8f0.js"></script>
  <script src="/runtime~main.3b5d1e08.js"></script>
*/
const getLinkScripts = function(doc) {
  let _resourcesArr = []
  let _resources = doc.find('script');
  _resources.map(function (idEl, _el) {
    if (_el.attr('src') !== undefined) {
      _resourcesArr.push(_el.attr('src'))
    }
  })
  return _resourcesArr
}


const parseResources = function(response) {
  const doc = parseHTML(response.body);
  let _resources = []
  _resources = _resources.concat(getImages(doc))
  _resources = _resources.concat(getLinkScripts(doc))
  _resources = _resources.concat(getLinkResources(doc))

  return _resources
}


module.exports = {
  parseResources
}
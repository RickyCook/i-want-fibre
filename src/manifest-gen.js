const PACKAGE = require('../package.json')
  /*const package = {
  name: 'test',
  version: '2.0.0',
  description: 'destr',
}*/


module.exports = options => {
  const data = {
    manifest_version: 2,

    name: 'I Want Fibre',
    version: PACKAGE.version,
    description: PACKAGE.description,
    author: PACKAGE.author,
    homepage_url: PACKAGE.homepage,

    content_scripts: [
      { matches: [ '*://*.realestate.com.au/*' ],
        js: [ 'reaCs.js' ],
      }
    ],
    background: {
      scripts: [ 'background.js' ],
    },
    permissions: [
      'webRequest', 'webRequestBlocking',

      '*://*.nbnco.net.au/*',
    ],

  }

  return { code: JSON.stringify(data) }
}

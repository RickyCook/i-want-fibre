let b
if (typeof browser !== 'undefined') b = browser
if (typeof chrome !== 'undefined') b = chrome

b.webRequest.onBeforeSendHeaders.addListener(
  ev => {
    // TODO limit to our addon
    const filteredHeaders = ev.requestHeaders.filter(header => {
      const name = header.name.toLowerCase()
      return !(
        name === 'referer' ||
        name === 'origin'
      )
    })
    return {
      requestHeaders: [
        ...filteredHeaders,
        {name: 'Referer', value: 'https://www.nbnco.com.au/'},
      ]
    }
  },
  {urls: ['*://*.nbnco.net.au/*']},
  ['blocking', 'requestHeaders'],
)

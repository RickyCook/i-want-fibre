import React from 'react'
import ReactDOM from 'react-dom'

import { AddressLookup } from './components/AddressLookup.jsx'

const cssContent = require('./reaCs.css')


function addCss() {
  const elId = `iwf-style`
  const existEl = document.getElementById(elId)
  const el = existEl ? existEl : document.createElement('style')
  el.id = elId
  el.textContent = cssContent
  if (!existEl) {
    console.debug(`Appending iwf style`)
    document.head.appendChild(el)
  } else {
    console.debug(`Existing iwf style`)
  }
}
function addRootEl(parentEl) {
  const elClass = `iwf-root`
  const existEls = parentEl.getElementsByClassName(elClass)

  const childEl = existEls.length === 0 ?
    document.createElement('div') :
    existEls[0]

  childEl.className = elClass

  if (existEls.length === 0) {
    // TODO put this before the buttons element
    parentEl.appendChild(childEl)
  }

  return childEl
}


function listingInfoFromNameEl(el) {
  const listingInfoEl = el.parentElement.parentElement.parentElement
  if (listingInfoEl.className.indexOf('listingInfo') < 0)
    console.error("Didn't get expected element:", listingInfoEl)
  return listingInfoEl
}


for (const listingNameEl of document.getElementsByClassName('name')) {
  if (listingNameEl.rel !== 'listingName') continue

  console.debug('Getting listing element for', listingNameEl)
  const listingInfoEl = listingInfoFromNameEl(listingNameEl)

  console.debug('Adding root element to', listingInfoEl)
  const rootEl = addRootEl(listingInfoEl)

  console.debug('Rendering')
  ReactDOM.render(
    <AddressLookup address={ listingNameEl.text } />,
    rootEl,
  )

  console.debug('Done rendering')
}

addCss()

address_components_map = {
	'street_number': 'streetNumber',
	'route': 'street',
	'locality': 'suburb',
	'postal_code': 'postCode',
	'administrative_area_level_1': 'state'
}
nbn_color_map = {
	'available': 'purple',
	'in_construction': 'brown',

	'unavailable': 'red',

	'failure': 'orange'
}


nbn_tabs = []


/***
 * Message handling
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('Message [%s]: %O', request['type'], request)

	if (request.type == "nbn_tab") {
		nbn_tabs.push(sender.tab)
	} else if (request.type == "lookup") {
		return doLookup(request, sendResponse)
	}
})


function hashCode(s){
	return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

function localStorageKey(text) {
	return 'nbn_geo_' + hashCode(text)
}

function streetNumber(address, geo, method) {
	if (typeof(method) === 'undefined') method = 0

	var number = null
	if (method === 0) {
		matches = address.match(new RegExp('\\d+[/\\\\]\\d+'))
		if (!(matches === null)) {
			number = matches[0].replace(new RegExp('\\d+[/\\\\]'), '')
		}
	} else if (method === 1) {
		matches = address.match(new RegExp('^\\d+'))
		if (!(matches === null)) {
			number = matches[0]
		}
	}

	if (method < 1 && number === null) {
		return streetNumber(address, geo, method + 1)
	}

	return number
}

function sendNBNMessage(request, sendResponse) {
	try_tab = function(tab) {
		if (tab === undefined) {
			nbn_tabs.shift()
			chrome.tabs.get(nbn_tabs[0].id, try_tab)
		} else {
			chrome.tabs.sendMessage(tab.id, request, function(response) {
				sendResponse(response)
			})
		}
	}
	chrome.tabs.get(nbn_tabs[0].id, try_tab)
}

function responseObject(message, type) {
	var color = ''
	if (type in nbn_color_map) {
		color = nbn_color_map[type]
	}
	return {
		'message': message,
		'color': color
	}
}

function geoFailResponse(geo) {
	if (geo.status == 'ZERO_RESULTS') {
		return responseObject(
			"Unknown address", 'failure')
	} else if (geo.status == 'OVER_QUERY_LIMIT') {
		return responseObject(
			"Over query limit (try reloading the page)", 'failure')
	} else {
		return responseObject(
			"Failed to load address", 'failure')
	}
}

function geoToQueryParams(geo) {
	// Parse the result geo into query data
	var nbn_req_data = geo.results[0].geometry.location
	address_components = geo.results[0].address_components
	for (i = 0; i < address_components.length; i++) {
		comp = address_components[i]
		for (j = 0; j < comp.types.length; j++) {
			if (comp.types[j] in address_components_map) {
				nbn_req_data[address_components_map[comp.types[j]]] = comp.short_name
			}
		}
	}

	// Corner case street numbers
	if (!('streetNumber' in nbn_req_data)) {
		number = streetNumber(address, nbn_req_data)
		if (number === null) {
			console.log("Unable to find a number for %s: %O", address, geo)
			return null
		} else {
			nbn_req_data['streetNumber'] = number
		}
	}

	return nbn_req_data
}

function withGeo(address, key, sendResponse, geo) {
	var nbn_req_data
	if (geo.status == 'OK') {
		localStorage[key] = JSON.stringify(geo)
		nbn_req_data = geoToQueryParams(geo)

		if (nbn_req_data === null) {
			sendResponse(responseObject(
				"Failed to parse address", 'failure'))
			return
		}

		sendNBNMessage({'type': 'lookup', 'data': nbn_req_data}, function(response) {
			if (response.servingArea === null) {
				sendResponse(responseObject(
					"NBN is unavailable", 'unavailable'))
			} else {
				sendResponse(responseObject(
					response.servingArea.serviceType + " is " + response.servingArea.serviceStatus,
					response.servingArea.serviceStatus))
			}
		})
	} else {
		console.log("Address lookup failed for %s: %O", address, geo)
		sendResponse(geoFailResponse(geo))
	}
}

function doLookup(request, sendResponse) {
	var
		address = request.address,
		key = localStorageKey(address)

	if (key in localStorage) {
		withGeo(address, key, sendResponse, JSON.parse(localStorage[key]))
	} else {
		$.getJSON(
			'https://maps.googleapis.com/maps/api/geocode/json',
			{"address": address, "sensor": false},
			$.proxy(withGeo, this, address, key, sendResponse)
		)
	}

	// Reply will be sent later
	return true
}

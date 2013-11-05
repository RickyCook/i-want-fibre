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

	'unavailable': 'red'
}
function localStorageKey(text) {
	return 'nbn_geo_' + hashCode(text)
}
function streetNumber(address, geo, method=0) {
	if (method === 0) {
		matches = el.text.match(/\d+[\/\\]\d+/)
		if (!(matches === null)) {
			return matches[0].replace(/\d+[\/\\]/, '')
		} else {
			return streetNumber(address, geo, method + 1)
		}
	}

	return null
}
$('[rel="listingName"]').each(function(k, el) {
	console.log(el.text)

	var content_el = $('<h3 class="title">')[0]
	content_el.textContent = "Loading NBN Status"
	$(el.parentElement.parentElement).after(content_el)

	var key = localStorageKey(el.text)
	withGeo = function(geo) {
		if (geo.status == 'OK') {
			localStorage[key] = JSON.stringify(geo)

			nbn_req_data = geo.results[0].geometry.location
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
				number = streetNumber(el.text, geo)
				if (number === null) {
					content_el.textContent = "Failed to parse address"
					content_el.style.color = 'orange'
					return
				} else {
					nbn_req_data['streetNumber'] = number
				}
			}

			chrome.runtime.sendMessage({'type': 'lookup', 'data': nbn_req_data}, function(response) {
				console.log('response message: %o', response)
				if (response.servingArea === null) {
					content_el.textContent = "NBN is unavailable"
					content_el.style.color = nbn_color_map['unavailable']
				} else {
					content_el.textContent = response.servingArea.serviceType + " is " + response.servingArea.serviceStatus
					if (response.servingArea.serviceStatus in nbn_color_map) {
						content_el.style.color = nbn_color_map[response.servingArea.serviceStatus]
					}
				}
			})
		} else {
			if (geo.status == 'ZERO_RESULTS') {
				content_el.textContent = "Unknown address"
			} else {
				content_el.textContent = "Failed to load address"
			}
			content_el.style.color = 'orange'
			console.log("Address lookup failed: %O", geo)
		}
	}

	if (key in localStorage) {
		withGeo(JSON.parse(localStorage[key]))
	} else {
		$.getJSON(
			'https://maps.googleapis.com/maps/api/geocode/json',
			{"address": el.text, "sensor": false},
			withGeo
		)
	}
})

function hashCode(s){
	return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

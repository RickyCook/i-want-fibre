address_components_map = {
	'street_number': 'streetNumber',
	'route': 'street',
	'locality': 'suburb',
	'postal_code': 'postCode',
	'administrative_area_level_1': 'state'
}
nbn_color_map = {
	'available': 'green',
	'in_construction': 'yellow',

	'unavailable': 'red'
}
$('[rel="listingName"]').each(function(k, el) {
	//if (k != 0) { return }
	console.log(el.text)

	content_el = $('<h3 class="title">')[0]
	content_el.textContent = "Loading NBN Status"
	$(el.parentElement.parentElement).after(content_el)

	$.getJSON(
		'https://maps.googleapis.com/maps/api/geocode/json',
		{"address": el.text, "sensor": false},
		function(result) {
			if (result.status == 'OK') {
				console.dir(result)
				nbn_req_data = result.results[0].geometry.location
				address_components = result.results[0].address_components
				for (i = 0; i < address_components.length; i++) {
					comp = address_components[i]
					for (j = 0; j < comp.types.length; j++) {
						if (comp.types[j] in address_components_map) {
							nbn_req_data[address_components_map[comp.types[j]]] = comp.short_name
						}
					}
				}
				chrome.runtime.sendMessage({'type': 'lookup', 'data': nbn_req_data}, function(response) {
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
				content_el.textContent = "Failed to load NBN status"
				content_el.style.color = 'red'
				console.log("Address parse failed:")
				console.dir(result)
			}
		}
	)
})

function hashCode(s){
	return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

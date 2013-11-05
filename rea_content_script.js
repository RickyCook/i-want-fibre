$('[rel="listingName"]').each(function(k, el) {
	var
		content_el = $('<h3 class="title">')[0],
		data = {'type': 'lookup', 'address': el.text}

	// Setup display
	content_el.textContent = "Loading NBN Status"
	$(el.parentElement.parentElement).after(content_el)

	// Send request
	chrome.runtime.sendMessage(data, function(response) {
		content_el.textContent = response.message
		content_el.style.color = response.color
	})
})

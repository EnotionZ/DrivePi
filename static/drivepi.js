(function() {
	var debug = true;
	var ws = new WebSocket('WS://' + location.host + '/websocket');
	ws.onopen = function() {
		if(debug) ws.send('Connected ' + (new Date()));

		turnRng.addEventListener('change', function() {
			ws.send('turn ' + turnRng.value);
		});
		driveRng.addEventListener('change', function() {
			ws.send('drive ' + driveRng.value);
		});
	};
	if(debug) {
		ws.onmessage = function(e) { console.log(e.data); };
	}
})();

(function() {
	var debug = true;
	var ws = new WebSocket('WS://' + location.host + '/websocket');
	ws.onopen = function() {

		var changeHandler = function() { ws.send(this.name + ' ' + this.value); };
		var mouseupHandler = function() { this.value = 0; changeHandler.call(this); };

		turnRng.addEventListener('change', changeHandler);
		turnRng.addEventListener('mouseup', mouseupHandler);
		driveRng.addEventListener('change', changeHandler);
		driveRng.addEventListener('mouseup', mouseupHandler);

		if(debug) ws.send('Connected ' + (new Date()));
	};
	if(debug) ws.addEventListener('message', function(e) { console.log(e.data); });
})();

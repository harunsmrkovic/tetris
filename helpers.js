/*
	helpers
*/

// random int, max excluded
function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function transpose(a) {
	return Object.keys(a[0]).map(
		function (c) { return a.map(function (r) { return r[c]; }); }
	);
}
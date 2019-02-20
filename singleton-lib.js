'use strict';

let singleton;

module.exports = {
	write(value) {
		singleton = value;
	},
	read() {
		return singleton;
	}
};

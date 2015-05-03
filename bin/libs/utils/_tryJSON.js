'use strict';

/**
 * Global modules
 */
var JSON5 = require('json5');
var _ = require('lodash');

/**
 * Function to test if a string is a valid JSON
 * @see http://stackoverflow.com/a/20392392
 * @param {string}   jsonString String representation of the JSON to try to parse
 * @param {function}   callback Callback to execute before the parsing
 */
function parse(jsonString, callback) {

	//Check if the parameter is a string
	if (_.isString(jsonString)) {

		try {

			var o = JSON5.parse(jsonString);

			if (o && typeof o === 'object' && o !== null) {

				callback(null, o);

			}

		} catch (err) {

			callback(new Error('There were an error parsing the information: ' + err));

		}

	} else {

		//If the parameter is an object, skip and return
		if (_.isObject(jsonString)) {

			callback(null, jsonString);

		} else {

			callback(new Error('Invalid information to parse'));

		}

	}

}

/**
 * Public methods exported
 */
module.exports = {
	parse: parse
};

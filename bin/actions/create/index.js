'use strict';

/**
 * Global modules
 */
var async = require('async');
var _ = require('lodash');
var path = require('path');

/**
 * Private modules
 */
var _configuration = require('./_configuration');
var _data = require('./_data');
var _html = require('./_html');
var _send = require('./_send');

/**
 * App initialization
 */
function init(cliOptions, paths, callback) {

	//Default options
	var defaultOptions = {
		config: path.join(paths.current, 'config.json'),
		sprint: path.join(paths.current, 'sprint.json'),
		output: path.join(paths.current, 'newsletter.html'),
		send: false
	};

	//Create the options object
	var options = _.assign(defaultOptions, cliOptions);

	//Run the steps in a waterfall
	async.waterfall([

		//Setup the configuration
		function(next) {

			_configuration.init(options, paths, function(err, configuration) {

				//Check errors
				if (err) {

					next(err);

				} else {

					libs.logger.info('Configuration loaded successfully...');

					next(null, configuration);

				}

			});

		},

		//Get the data from Trello
		function(configuration, next) {

			_data.init(configuration, paths, function(err, data) {

				//Check errors
				if (err) {

					next(err);

				} else {

					libs.logger.info('Information from Trello getted successfully...');

					next(null, configuration, data);

				}

			});

		},

		//Create the HTML for the newsletter
		function(configuration, data, next) {

			_html.init(data, configuration, paths, function(err, html) {

				//Check errors
				if (err) {

					next(err);

				} else {

					libs.logger.info('Newsletter created successfully...');

					next(null, configuration, html);

				}

			});

		},

		//Try to send the newsletter
		function(configuration, html, next) {

			//Check if is neccesary send the newsletter
			if (configuration.send) {

				_send.init(html, configuration, paths, function(err) {

					//Check errors
					if (err) {

						next(err);

					} else {

						libs.logger.info('Newsletter sent successfully...');

						next();

					}

				});

			} else {

				next();

			}

		}

	], function(err) {

		//Check errors
		if (err) {

			callback(err);

		} else {

			callback();

		}

	});

}

/**
 * Public methods exported
 */
module.exports = {
	init: init
};

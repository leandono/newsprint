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

	//Run the steps in waterfall
	async.waterfall([

		//Setup the configuration
		function(next){

			_configuration.init(options, paths, function(err){

				//Check errors
				if(err) {

					next(err);

				} else {

					libs.logger.info('Configuration loaded successfully...');

					next();

				}

			});

		},

		//Get the data from Trello
		function(next){

			_data.init(options, paths, function(err, data){

				//Check errors
				if(err) {

					next(err);

				} else {

					libs.logger.info('Information from Trello getted successfully...');

					next(null, data);

				}

			});

		},

		//Create the HTML for the newsletter
		function(data, next){

			_html.init(data, options, paths, function(err, html){

				//Check errors
				if(err) {

					next(err);

				} else {

					libs.logger.info('Newsletter created succesfully...');

					next(null, html);

				}

			});

		},

		//Try to send the newsletter
		function(html, next){

			//Check if is neccesary send the newsletter
			if(options.send){

				_send.init(html, options, paths, function(err){

					//Check errors
					if(err) {

						next(err);

					} else {

						libs.logger.info('Newsletter sended succesfully...');

						next();

					}

				});

			} else {

				next();

			}

		}

	], function(err){

		//Check errors
		if(err) {

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

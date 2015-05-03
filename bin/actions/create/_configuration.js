'use strict';

/**
 * Global modules
 */
var async = require('async');
var fs = require('fs-extra');
var JSON5 = require('json5');
var inspector = require('schema-inspector');


/**
 * App initialization
 */
function init(options, paths, callback) {

	//Run the steps in serie
	async.series([

		//Check the configuration
		function(next){
			_checkConfiguration(options, next);
		},

		//Validate the configuration
		function(next){
			_validateConfiguration(options, next);
		}

	], function(err){

		//Check errors
		if(err) {

			//Exit
			callback(err);

		} else {

			//Next
			callback();

		}

	});

}

/**
 * Check if the required configuration exists
 * @param  {function}  next  Async callback
 */
function _checkConfiguration(options, next){

	//Check in parallel
	async.parallel([

		//Check configuration
		function(callback){

			//Check if exists
			fs.exists(options.config, function (exists) {

				if(!exists){

					//Exit
					callback('The configuration doen\'t exists. Please create one first!');

				} else {

					var file = fs.readFileSync(options.config);

					//TODO: Use try catch
					options.config = JSON5.parse(file);

					//Next!
					callback();

				}

			});

		},

		//Check sprint
		function(callback){

			//Check if exists
			fs.exists(options.sprint, function (exists) {

				if(exists){

					var file = fs.readFileSync(options.sprint);

					//TODO: Use try catch
					options.sprint = JSON5.parse(file);

				} else {

					//Empty the prop
					options.sprint = null;

				}

				callback();

			});

		}

	], function(err){

		//Next!
		next(err);

	});

}

/**
 * Validate that the configuration is correct
 * @param  {function}  next  Async callback
 */
function _validateConfiguration(options, next){

	//Validate in parallel
	async.parallel([

		//Validate the configuration
		function(callback){

			//Schema validation
			var schema = {
				type: 'object',
				properties: {
					trello: {
						type: 'object',
						properties: {
							key: {
								type: 'string'
							},
							token: {
								type: 'string'
							},
							board: {
								type: 'string'
							}
						}
					},
					mailer: {
						optional: true,
						type: 'object',
						properties: {
							enabled: {
								type: 'boolean'
							},
							service: {
								type: 'string'
							},
							auth: {
								type: 'object'
							}
						}
					}
				}
			};

			//Check if the schema is valid
			if(inspector.validate(schema, options.config).valid === false){

				//Exit!
				callback('The configuration file doesn\'t respect the required format. Please check it!');

			} else {

				//Continue
				callback();

			}

		},

		//Validate the sprint
		function(callback){

			//Check if there are a sprint object
			if(options.sprint){

				//Schema validation
				var schema = {
					type: 'object',
					properties: {
						mail: {
							optional: true,
							type: 'object',
							properties: {
								subject: {
									type: 'string'
								},
								from: {
									type: 'string'
								},
								to: {
									type: 'string'
								},
								cc: {
									optional: true,
									type: 'string'
								},
								bcc: {
									optional: true,
									type: 'string'
								},
								replyTo: {
									optional: true,
									type: 'string'
								}
							}
						},
						content: {
							optional: true,
							type: 'object',
							properties: {
								title: {
									optional: true,
									type: 'string'
								},
								subtitle: {
									optional: true,
									type: 'string'
								},
								intro: {
									optional: true,
									type: 'array'
								},
								lists: {
									optional: true,
									type: 'array',
									items: { 
										type: 'object',
										properties: {
											name: {
												type: 'string'
											},
											desc: {
												optional: true,
												type: 'string'
											}
										}
									}
								},
								final: {
									optional: true,
									type: 'array'
								}
							}
						},
						template: {
							optional: true,
							type: 'object',
							properties: {
								styles: {
									optional: true,
									type: 'object'
								}
							}
						}
					}
				};

				//Check if the schema is valid
				if(inspector.validate(schema, options.sprint).valid === false){

					//Exit!
					callback('The sprint file doesn\'t respect the required format. Please check it!');

				} else {

					//Continue
					callback();

				}

			} else {

				//Continue
				callback();

			}

		}

	], function(err){

		//Next!
		next(err);

	});

}

/**
 * Public methods exported
 */
module.exports = {
	init: init
};

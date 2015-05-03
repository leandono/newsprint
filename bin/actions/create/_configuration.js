'use strict';

/**
 * Global modules
 */
var async = require('async');
var fs = require('fs-extra');
var inspector = require('schema-inspector');


/**
 * App initialization
 */
function init(options, paths, callback) {

	//Run the steps in a waterfall
	async.waterfall([

		//Check the configuration
		function(next){
			_getConfiguration(options, next);
		},

		//Validate the configuration
		function(configuration, next){
			_validateConfiguration(configuration, next);
		}

	], function(err, configuration){

		//Next
		callback(err, configuration);

	});

}

/**
 * Get the configuration if exists
 * @param  {function}  next  Async callback
 */
function _getConfiguration(options, next){

	//Check in parallel
	async.parallel([

		//Check configuration
		function(callback){

			//Check if exists
			fs.exists(options.config, function (exists) {

				if(!exists){

					//Exit
					callback('The configuration doen\'t exists. Please create one first! \n https://github.com/rodati/newsprint#configuration');

				} else {

					var file = fs.readFileSync(options.config, {
						encoding: 'utf8'
					});

					//Try to parse the information
					libs.utils.tryJSON.parse(file, function(err, config){

						options.config = config;

						//Next!
						callback(err);

					});

				}

			});

		},

		//Check sprint
		function(callback){

			//Check if exists
			fs.exists(options.sprint, function (exists) {

				if(exists){

					var file = fs.readFileSync(options.sprint, {
						encoding: 'utf8'
					});

					//Try to parse the information
					libs.utils.tryJSON.parse(file, function(err, sprint){

						options.sprint = sprint;

						//Next!
						callback(err);

					});

				} else {

					//Set as false
					options.sprint = false;

					//Next!
					callback();

				}

			});

		}

	], function(err){

		//Next!
		next(err, options);

	});

}

/**
 * Validate that the configuration is correct
 * @param  {function}  next  Async callback
 */
function _validateConfiguration(configuration, next){

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
			if(inspector.validate(schema, configuration.config).valid === false){

				//Exit!
				callback('The configuration file doesn\'t respect the required format. Please check it! \n https://github.com/rodati/newsprint#configjson-required');

			} else {

				//Continue
				callback();

			}

		},

		//Validate the sprint
		function(callback){

			//Check if there are a sprint object
			if(configuration.sprint){

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
				if(inspector.validate(schema, configuration.sprint).valid === false){

					//Exit!
					callback('The sprint file doesn\'t respect the required format. Please check it! \n https://github.com/rodati/newsprint#sprintjson-optional');

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
		next(err, configuration);

	});

}

/**
 * Public methods exported
 */
module.exports = {
	init: init
};

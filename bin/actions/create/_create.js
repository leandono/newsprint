//TODO: Modularize all!

'use strict';

/**
 * Global modules
 */
var logger = require('winston');
var Trello = require('node-trello');
var async = require('async');
var fs = require('fs-extra');
var marked = require('marked');
var path = require('path');
var JSON5 = require('json5');
var juice = require('juice');
var minify = require('html-minifier').minify;
var inspector = require('schema-inspector');
var nodemailer = require('nodemailer');
var htmlToText = require('html-to-text');
var _ = require('lodash');
_.mixin(require('lodash-deep'));

/**
 * Logger setup
 */

//Configure winston CLI
logger.cli();

//Remove the default transport
logger.remove(logger.transports.Console);

//Set logging using the console
logger.add(logger.transports.Console, {
	level: 'info',
	silent: false,
	colorize: true
});

/**
 * Private variables
 */
var _root = path.normalize(__dirname);
var _current = path.normalize(process.cwd());

var _tmpl = path.join(_root, '..', 'tmpl');
var _newsTmpl = path.join(_tmpl, 'newsletter.tmpl.html');

var _defaults = {
	config: path.join(_current, 'config.json'),
	sprint: path.join(_current, 'sprint.json'),
	output: path.join(_current, 'newsletter.html'),
	send: false
};
var _options;

/**
 * App initialization
 */
function init(options, callback) {

	//Create the options object
	_options = _.assign(_defaults, options);

	//Run the steps in serie
	async.series([

		//Check the configuration
		function(next){
			_checkConfiguration(next);
		},

		//Validate the configuration
		function(next){
			_validateConfiguration(next);
		}

	], function(err){

		//Check errors
		if(err) {

			callback(err);

		} else {

			logger.info('Configuration file loaded successfully...');

			//If there are sprint file
			if(_options.config.sprint){

				logger.info('Sprint file loaded successfully...');

			}

			logger.info('Getting information of the sprint from Trello...');

			//Get the data from Trello
			_getTrelloData(callback);

		}

	});

}

/**
 * Check if the required configuration exists
 * @param  {function}  next  Async callback
 */
function _checkConfiguration(next){

	//Check in parallel
	async.parallel([

		//Check configuration
		function(callback){

			//Check if exists
			fs.exists(_options.config, function (exists) {

				if(!exists){

					//Exit
					callback('The configuration doen\'t exists. Please create one first!');

				} else {

					var file = fs.readFileSync(_options.config);

					//TODO: Use try catch
					_options.config = JSON5.parse(file);

					//Next!
					callback();

				}

			});

		},

		//Check sprint
		function(callback){

			//Check if exists
			fs.exists(_options.sprint, function (exists) {

				if(exists){

					var file = fs.readFileSync(_options.sprint);

					//TODO: Use try catch
					_options.sprint = JSON5.parse(file);

				} else {

					//Empty the prop
					_options.sprint = null;

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
function _validateConfiguration(next){

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
			if(inspector.validate(schema, _options.config).valid === false){

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
			if(_options.sprint){

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
				if(inspector.validate(schema, _options.sprint).valid === false){

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
 * Request the data to Trello to create the newsletter
 */
function _getTrelloData(callback) {

	//Create a new instance of Trello
	var t = new Trello(_options.config.trello.key, _options.config.trello.token);

	//Custom mixin for lodash
	_.mixin({
		'findByValues': function(collection, property, values) {
			return _.filter(collection, function(item) {
				return _.contains(values, item[property]);
			});
		}
	});

	//Get all information in parallel
	async.parallel({

		//Get the list information
		lists: function(next){
			_getLists(t, next);
		},

		//Get extra infomation to show
		extras: function(next){
			_getExtras(t, next);
		}

	}, function(err, data){

		//Check errors
		if(err) {

			//Exit
			callback(err);

		} else {

			logger.info('Information from Trello getted successfully...');

			logger.info('Creating newsletter...');

			//Process the data from Trello
			_processData(data, callback);

		}

	});

}

/**
 * Get the lists information of the board
 * @param  {function}  t  Trello instance
 * @param  {function}  next  Async callback
 */
function _getLists(t, next){

	//Params for the service
	var params = [
		'fields=name,pos',
		'cards=open',
		'card_fields=name,labels,pos,desc,idMembers,idAttachmentCover,url'
	];

	//Get the lists of the board
	t.get('/1/boards/' + _options.config.trello.board + '/lists?' + params.join('&'), function(err, data) {

		//Check errors
		if(err){

			next(new Error('There was an error getting the information from Trello: ' + err));

		//Else, read the data
		} else {

			//Check if there are data
			if(!data.length){

				next(new Error('The Trello board doesn\'t have information to use'));

			//Process the information
			} else {

				//Next!
				next(null, data);

			}

		}

	});

}

/**
 * Get extra information of the cards
 * @param  {function}  t  Trello instance
 * @param  {function}  next  Async callback
 */
function _getExtras(t, next){

	//Params for the service
	var params = [
		'attachments=cover',
		'attachment_fields=previews,url',
		'members=true',
		'member_fields=initials,avatarHash,fullName',
		'fields=name'
	];

	//Get the lists of the board
	t.get('/1/boards/' + _options.config.trello.board + '/cards?' + params.join('&'), function(err, data) {

		//Check errors
		if(err){

			next(new Error('There was an error getting the information from Trello: ' + err));

		//Else, read the data
		} else {

			//Check if there are data
			if(!data.length){

				next(new Error('The Trello board doesn\'t have information to use'));

			//Process the information
			} else {

				//Next!
				next(null, data);

			}

		}

	});

}

/**
 * Request the data to Trello to create the newsletter
 * @param  {object}  data  The data request to Trello
 */
function _processData(data, callback) {

	//Process in a waterfall
	async.waterfall([

		//First, sort and filter the data
		function(next){
			_sortFilterData(data, next);
		},

		//Then, create the content
		function(dataProcessed, next){
			_createHtml(dataProcessed, next);
		}

	], function(err, dataHtml){

		logger.info('Newsletter created succesfully...');

		//Check errors
		if(err) {

			callback(err);

		} else {

			//Check if need to to send the newsletter
			if(_options.send){

				//Send the newsletter!
				_sendNews(dataHtml, callback);

			} else {

				logger.info('Thanks for use Newsprint!');

				//Execute the main callback
				callback();

			}

		}

	});

}

/**
 * Sort and filter the data
 * @param  {object}  data  The data request to Trello
 * @param  {function}  next  Async callback
 */
function _sortFilterData(data, next){

	//Check if there are a customization for the lists
	if(_.deepGet(_options.sprint, 'content.lists')){

		//Filtered data
		var filtered = _.findByValues(data.lists, 'name', _.pluck(_options.sprint.content.lists, 'name'));

		//Sortered data
		var sortered = [];

		//For each list
		async.each(_options.sprint.content.lists, function(list, callback){

			//Find the list
			var finded = _.find(filtered, { 'name': list.name });

			//If the list exists
			if(finded){

				//Save the description
				finded.desc = list.desc;

				//Find the list in the filtered data
				sortered.push(finded);

			}

			//Go go!
			callback();

		}, function(){

			//Save the references
			data.lists = sortered;

			//Next!
			next(null, data);
		
		});

	//Else, skip
	} else {

		//Next!
		next(null, data);

	}

}

/**
 * Create the HTML for the newsletter
 * @param  {object}  data  The data request to Trello filtered/sortered (or not)
 * @param  {function}  next  Async callback
 */
function _createHtml(filteredData, next){

	//Process in a waterfall
	async.waterfall([

		//Read the template for the newsletter
		//TODO: Allow custom templates
		function(callback){

			//Read the base template
			//TODO: Check if the file exists
			fs.readFile(_newsTmpl, function (err, template) {

				//Check errors
				if(err) {

					callback(new Error('There was an error reading the template file: ' + err));

				} else {

					callback(null, template);

				}				

			});

		},

		//Then, create the content
		function(template, callback){

			//Compile the template
			var tmpl = _.template(template, {
				'imports': {
					'md': marked
				}
			});

			//Create the HTML
			var html = tmpl({
				content: _.deepGet(_options.sprint, 'content') || {},
				template: _.deepGet(_options.sprint, 'template') || {},
				data: filteredData
			});

			//Inline and minify the HTML
			html = juice(minify(html, {
				removeComments: true,
				collapseWhitespace: true
			}), {
				removeStyleTags: true,
				preserveMediaQueries: true
			});

			//Next
			callback(null, html);

		//Create the .html
		//TODO: Check if the file created is to heavy
		}, function(html, callback){

			//Ensure that the file exists
			fs.ensureFile(_options.output, function(err) {

				//Check errors
				if(err){

					callback(new Error('There was an error creating the .html: ' + err));

				} else {

					//Write the HTML into the .html
					fs.writeFile(_options.output, html, function(error){

						//Check errors
						if(error){

							callback(new Error('There was an error writing the .html: ' + error));

						} else {

							//Next
							next(null, html);

						}

					});

				}

			});

		}

	], function(err, dataHtml){

		//Check errors
		if(err) {

			logger.error(err);

		} else {

			//Go!
			next(null, dataHtml);

		}

	});

}

/**
 * Send the newsletter
 * @param  {string}  htmlData  The HTML of the newsletter
 */
function _sendNews(htmlData, callback){

	//Check if the configuration for the email exists
	if(_.deepGet(_options, 'sprint.mail')){

		//Mail options
		var mailOptions = {
			subject: _.deepGet(_options, 'sprint.mail.subject') ? _options.sprint.mail.subject : '[Newsprint] Sprint Newsletter', 
			text: htmlToText.fromString(htmlData),
			html: htmlData
		};

		//Create the transport
		var transporter = nodemailer.createTransport();

		//Try to send
		transporter.sendMail(_.assign(mailOptions, _options.sprint.mail), function(err, info){

			//Check errors
			if(err){

				callback('There was an error sending the newsletter: ' + err);

			//Ok!
			} else {

				//Check if there errors in the response
				if(info.errors.length){

					callback('There was an error sending the newsletter: ' + info.errors.join(' '));

				} else {

					logger.info('The newsletter was sended! :D');

				}

			}

		});

	} else {

		logger.warn('To send the newsletter is required some neccesary information in your sprint file (mail.from, mail.to, mail.subject). Skipping...');

		callback();

	}

}

/**
 * Public methods exported
 */
module.exports = {
	init: init
};

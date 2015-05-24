'use strict';

/**
 * Global modules
 */
var async = require('async');
var fs = require('fs-extra');
var juice = require('juice');
var minify = require('html-minifier').minify;
var marked = require('marked');
var path = require('path');
var _ = require('lodash');
_.mixin(require('lodash-deep'));

/**
 * Create the HTML for the newsletter using the data requested to Trello
 * @param {object}  data  The data request to Trello
 * @param {object} configuration Configuration for the job
 * @param {object} paths Paths of the module and executation
 * @param {function} callback Async callback
 */
function init(data, configuration, paths, callback) {

	//Process in a waterfall
	async.waterfall([

		//First, sort and filter the data
		function(next) {
			_sortFilterData(data, configuration, paths, next);
		},

		//Then, create the content
		function(dataProcessed, next) {
			_createHtml(dataProcessed, configuration, paths, next);
		}

	], function(err, html) {

		//Next
		callback(err, html);

	});

}

/**
 * Sort and filter the data
 * @param {object}  data  The data request to Trello
 * @param {object} configuration Configuration for the job
 * @param {object} paths Paths of the module and executation
 * @param {function} next Async callback
 */
function _sortFilterData(data, configuration, paths, next) {

	//Check if there are a customization for the lists
	if (_.deepHas(configuration, 'sprint.content.lists')) {

		//Filter the lists
		var filtered = _.findByValues(data.lists, 'name', _.pluck(configuration.sprint
			.content.lists, 'name'));

		//Sortered data
		var sortered = [];

		//For each list
		async.each(configuration.sprint.content.lists, function(list, nextList) {

			//Find the list
			var finded = _.find(filtered, {
				'name': list.name
			});

			//If the list exists
			if (finded) {

				//Save the description
				finded.desc = list.desc;

				//If there are cards and labels to filter
				if (list.labels && finded.cards.length) {

					//Check if the card has some specific label
					var cards = _.filter(finded.cards, function(card) {

						var intersection = _.intersection(_.map(card.labels, 'name'), list.labels);

						return intersection.length;

					});

					//Save the cards filtered
					finded.cards = cards;

				}

				//Find the list in the filtered data
				sortered.push(finded);

			}

			//Go go!
			nextList();

		}, function() {

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
 * @param {object}  filteredData  The data request to Trello filtered/sortered (or not)
 * @param {object} configuration Configuration for the job
 * @param {object} paths Paths of the module and executation
 * @param {function} next Async callback
 */
function _createHtml(filteredData, configuration, paths, next) {

	var tmplFolder = path.join(paths.root, '..', 'tmpl');
	var template = path.join(tmplFolder, 'newsletter.html');

	//Process in a waterfall
	async.waterfall([

		//Read the template for the newsletter
		//TODO: Allow custom templates
		function(callback) {

			//Read the base template
			//TODO: Check if the file exists
			fs.readFile(template, function(err, templateData) {

				//Check errors
				if (err) {

					callback(new Error('There was an error reading the template file: ' +
						err));

				} else {

					callback(null, templateData);

				}

			});

		},

		//Then, create the content
		function(templateData, callback) {

			//Compile the template
			var tmpl = _.template(templateData, {
				'imports': {
					'md': marked
				}
			});

			//Create the HTML
			var html = tmpl({
				content: _.deepGet(configuration, 'sprint.content') || {},
				template: _.deepGet(configuration, 'sprint.template') || {},
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

		},

		//Then, create the .html
		//TODO: Check if the file created is to heavy
		function(html, callback) {

			//Ensure that the file exists
			fs.ensureFile(configuration.output, function(err) {

				//Check errors
				if (err) {

					callback(new Error('There was an error creating the .html: ' + err));

				} else {

					//Write the HTML into the .html
					fs.writeFile(configuration.output, html, function(error) {

						//Check errors
						if (error) {

							callback(new Error('There was an error writing the .html: ' +
								error));

						} else {

							//Next
							callback(null, html);

						}

					});

				}

			});

		}

	], function(err, dataHtml) {

		//Next
		next(err, dataHtml);

	});

}

/**
 * Public methods exported
 */
module.exports = {
	init: init
};

'use strict';

/**
 * Global modules
 */
var async = require('async');
var fs = require('fs-extra');
var juice = require('juice');
var minify = require('html-minifier').minify;
var marked = require('marked');
var _ = require('lodash');

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

		//Then, extend the cards
		function(filteredData, next) {
			_extendCards(filteredData, configuration, paths, next);
		},

		//Then, create the content
		function(extendedData, next) {
			_createHtml(extendedData, configuration, paths, next);
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
	if (_.has(configuration, 'sprint.content.lists') && configuration.sprint.content.lists.length) {

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
 * Extend/overwrite the props of the cards
 * @param {object}  data  The data request to Trello
 * @param {object} configuration Configuration for the job
 * @param {object} paths Paths of the module and executation
 * @param {function} next Async callback
 */
function _extendCards(filteredData, configuration, paths, next) {

	//Check if there are a customization for the cards
	if (_.has(configuration, 'sprint.content.cards') && configuration.sprint.content.cards) {

		//For each list
		async.each(filteredData.lists, function(list, nextList) {

			//Check if there are cards
			if (list.cards.length) {

				//For each card
				async.each(list.cards, function(card, nextCard) {

					//Extend the labels
					if (configuration.sprint.content.cards.labels && configuration.sprint.content.cards.labels.length) {

						var labels = _.map(card.labels, function(label) {

							//Get the custom props
							var props = _.find(configuration.sprint.content.cards.labels, {
								'name': label.name
							});

							if (props) {
								return _.assign(label, props);
							} else {
								return label;
							}

						});

						//Assign the reference
						card.labels = labels;

					}

					//Next!
					nextCard();

				}, function() {

					//Next!
					nextList();

				});

				//Skip
			} else {

				nextList();

			}

		}, function() {

			//Save the references
			filteredData.lists = filteredData.lists;

			//Next!
			next(null, filteredData);

		});

		//Else, skip
	} else {

		//Next!
		next(null, filteredData);

	}

}

/**
 * Create the HTML for the newsletter
 * @param {object}  extendedData  The data request to Trello filtered/sortered (or not)
 * @param {object} configuration Configuration for the job
 * @param {object} paths Paths of the module and executation
 * @param {function} next Async callback
 */
function _createHtml(extendedData, configuration, paths, next) {

	//Process in a waterfall
	async.waterfall([

		//Read the template for the newsletter
		function(callback) {

			//Read the base template
			fs.readFile(configuration.template, function(err, templateData) {

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
				content: _.get(configuration, 'sprint.content') || {},
				template: _.get(configuration, 'sprint.template') || {},
				data: extendedData
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

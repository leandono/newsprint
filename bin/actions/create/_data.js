'use strict';

/**
 * Global modules
 */
var async = require('async');
var Trello = require('node-trello');
var _ = require('lodash');

/**
 * Custom mixin for lodash
 */
_.mixin({
	'findByValues': function(collection, property, values) {
		return _.filter(collection, function(item) {
			return _.contains(values, item[property]);
		});
	}
});

/**
 * Request the data to Trello to create the newsletter
 * @param {object} configuration Configuration for the job
 * @param {object} paths Paths of the module and executation
 * @param {function} callback Async callback
 */
function init(configuration, paths, callback) {

	//Create a new instance of Trello
	var t = new Trello(configuration.config.trello.key, configuration.config.trello.token);

	//Get all information in parallel
	async.parallel({

		//Get the list information
		lists: function(next) {
			_getLists(t, configuration, next);
		},

		//Get extra infomation to show
		extras: function(next) {
			_getExtras(t, configuration, next);
		}

	}, function(err, data) {

		//Next
		callback(err, data);

	});

}

/**
 * Get the lists information of the board
 * @param  {function}  t  Trello instance
 * @param  {object} configuration Configuration for the job
 * @param  {function}  next  Async callback
 */
function _getLists(t, configuration, next) {

	//Params for the service
	var params = [
		'fields=name,pos',
		'cards=open',
		'card_fields=name,labels,pos,desc,idMembers,idAttachmentCover,url'
	];

	//Get the lists of the board
	t.get('/1/boards/' + configuration.config.trello.board + '/lists?' + params.join('&'), function(err, data) {

		//Check errors
		if (err) {

			next(new Error('There was an error getting the information from Trello: ' + err));

			//Else, read the data
		} else {

			//Check if there are data
			if (!data.length) {

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
 * @param  {object} configuration Configuration for the job
 * @param  {function}  next  Async callback
 */
function _getExtras(t, configuration, next) {

	//Params for the service
	var params = [
		'attachments=cover',
		'attachment_fields=previews,url',
		'members=true',
		'member_fields=initials,avatarHash,fullName,username',
		'fields=name'
	];

	//Get the lists of the board
	t.get('/1/boards/' + configuration.config.trello.board + '/cards?' + params.join('&'), function(err, data) {

		//Check errors
		if (err) {

			next(new Error('There was an error getting the information from Trello: ' + err));

			//Else, read the data
		} else {

			//Check if there are data
			if (!data.length) {

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
 * Public methods exported
 */
module.exports = {
	init: init
};

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
 */
function init(options, paths, callback) {

	//Create a new instance of Trello
	var t = new Trello(options.config.trello.key, options.config.trello.token);

	//Get all information in parallel
	async.parallel({

		//Get the list information
		lists: function(next){
			_getLists(t, options, next);
		},

		//Get extra infomation to show
		extras: function(next){
			_getExtras(t, options, next);
		}

	}, function(err, data){

		//Check errors
		if(err) {

			//Exit
			callback(err);

		} else {

			//Next
			callback(null, data);

		}

	});

}

/**
 * Get the lists information of the board
 * @param  {function}  t  Trello instance
 * @param  {function}  next  Async callback
 */
function _getLists(t, options, next){

	//Params for the service
	var params = [
		'fields=name,pos',
		'cards=open',
		'card_fields=name,labels,pos,desc,idMembers,idAttachmentCover,url'
	];

	//Get the lists of the board
	t.get('/1/boards/' + options.config.trello.board + '/lists?' + params.join('&'), function(err, data) {

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
function _getExtras(t, options, next){

	//Params for the service
	var params = [
		'attachments=cover',
		'attachment_fields=previews,url',
		'members=true',
		'member_fields=initials,avatarHash,fullName',
		'fields=name'
	];

	//Get the lists of the board
	t.get('/1/boards/' + options.config.trello.board + '/cards?' + params.join('&'), function(err, data) {

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
 * Public methods exported
 */
module.exports = {
	init: init
};

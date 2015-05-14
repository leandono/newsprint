'use strict';

/**
 * Global modules
 */
var nodemailer = require('nodemailer');
var htmlToText = require('html-to-text');
var _ = require('lodash');
_.mixin(require('lodash-deep'));


/**
 * Private constants
 */
var _SUBJECT = '[NewSprint] Sprint Newsletter';

/**
 * Try to send the newsletter
 * @param {string}  htmlData  The HTML of the newsletter
 * @param {object} configuration Configuration for the job
 * @param {object} paths Paths of the module and executation
 * @param {function} callback Async callback
 */
function init(html, configuration, paths, callback) {

	//Check if the configuration for the email exists
	if(_.deepGet(configuration, 'sprint.mail')){

		//Mail options
		var mailOptions = {
			subject: _.deepGet(configuration, 'sprint.mail.subject') ? configuration.sprint.mail.subject : _SUBJECT, 
			text: htmlToText.fromString(html),
			html: html
		};

		//Create the transport
		var transporter = nodemailer.createTransport();

		//Try to send
		transporter.sendMail(_.assign(mailOptions, configuration.sprint.mail), function(err, info){

			//Check errors
			if(err){

				callback('There was an error sending the newsletter: ' + err);

			//Ok!
			} else {

				//Check if there errors in the response
				if(info.errors.length){

					callback('There was an error sending the newsletter: ' + info.errors.join(' '));

				} else {

					callback();

				}

			}

		});

	} else {

		callback('To send the newsletter is required some neccesary information in your sprint file (mail.from, mail.to, mail.subject). Skipping... \n https://github.com/rodati/newsprint#sprintjson-optional');

	}

}

/**
 * Public methods exported
 */
module.exports = {
	init: init
};

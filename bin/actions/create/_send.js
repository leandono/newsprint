'use strict';

/**
 * Global modules
 */
var nodemailer = require('nodemailer');
var htmlToText = require('html-to-text');
var _ = require('lodash');
_.mixin(require('lodash-deep'));


/**
 * Try to send the newsletter
 * @param  {string}  htmlData  The HTML of the newsletter
 */
function init(html, options, paths, callback) {

	//Check if the configuration for the email exists
	if(_.deepGet(options, 'sprint.mail')){

		//Mail options
		var mailOptions = {
			subject: _.deepGet(options, 'sprint.mail.subject') ? options.sprint.mail.subject : '[Newsprint] Sprint Newsletter', 
			text: htmlToText.fromString(html),
			html: html
		};

		//Create the transport
		var transporter = nodemailer.createTransport();

		//Try to send
		transporter.sendMail(_.assign(mailOptions, options.sprint.mail), function(err, info){

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

		callback('To send the newsletter is required some neccesary information in your sprint file (mail.from, mail.to, mail.subject). Skipping...');

	}

}

/**
 * Public methods exported
 */
module.exports = {
	init: init
};

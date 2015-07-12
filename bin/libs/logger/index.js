'use strict';

/**
 * Main modules
 */
var logger = require('winston');

/**
 * Logger setup
 */

//Configure winston CLI
logger.cli();

//Remove the default transport
logger.remove(logger.transports.Console);

//Set logging using the console
logger.add(logger.transports.Console, {
	level: process.env.DEBUG ? 'debug' : 'info',
	silent: false,
	colorize: true
});

/**
 * Public methods exported
 */
module.exports = logger;

#!/usr/bin/env node

'use strict';

/**
 * Main modules
 */
var logger = require('winston');
var program = require('commander');
var pkg = require('../package.json');

/**
 * Private modules
 */
var actions = {
	create: require('./_create')
};

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
 * Program commands
 */
program
	.version(pkg.version);

program
	.description(pkg.description);

program
	.command('create')
	.description('only create the newsletter')
	.option('-c, --config <path>', 'path for the configuration file. defaults to ./config.json')
	.option('-p, --sprint <path>', 'path for the sprint file')
	.option('-o, --output <path>', 'path where save the newsletter html. defaults to ./newsletter.html')
	.option('-s, --send', 'try to send by email the newsletter. by default false')
	.action(function(env){

		var options = {};

		if(env.config){
			options.config = env.config;
		}

		if(env.sprint){
			options.sprint = env.sprint;
		}

		if(env.output){
			options.output = env.output;
		}

		if(env.send){
			options.send = env.send;
		}

		actions.create.init(options, function(err){
			if(err){
				logger.error(err);
			}
			process.exit();
		});

	});

program.parse(process.argv);

/**
 * Default behavior
 */
if (!program.args.length) {
	program.help();
	process.exit();
}

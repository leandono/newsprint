#!/usr/bin/env node

'use strict';

/**
 * Main modules
 */
var program = require('commander');
var path = require('path');
var pkg = require('../package.json');

/**
 * Private modules
 */
var actions = require('./actions');
var libs = require('./libs');

/**
 * Globals
 */

GLOBAL.libs = libs;

/**
 * Private variables
 */
var _paths = {
	root: path.normalize(__dirname),
	current: path.normalize(process.cwd())
};

/**
 * Program commands
 */
program
	.version(pkg.version);

program
	.description(pkg.description);

program
	.command('create')
	.description('create the newsletter')
	.option('-c, --config <path>', 'path for the configuration file. defaults to ./config.json')
	.option('-p, --sprint <path>', 'path for the sprint file. defaults to ./sprint.json')
	.option('-o, --output <path>', 'path where save the newsletter html. defaults to ./newsletter.html')
	.option('-b, --open', 'after created, open the newsletter in the browser. false by default')
	.option('-s, --send', 'try to send by email the newsletter. false by default')
	.option('-t, --template <path>', 'path for the custom template file.')
	.action(function(env) {

		var options = {};

		if (env.config) {
			options.config = env.config;
		}

		if (env.template) {
			options.template = env.template;
		}

		if (env.sprint) {
			options.sprint = env.sprint;
		}

		if (env.output) {
			options.output = env.output;
		}

		if (env.open) {
			options.open = env.open;
		}

		if (env.send) {
			options.send = env.send;
		}

		actions.create.init(options, _paths, function(err) {

			if (err) {

				libs.logger.error(err);

			} else {

				libs.logger.info('Thanks for use NewSprint!');

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

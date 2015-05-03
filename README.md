# NewSprint

A little module that allow you to create and send a newsletter/resume of your current sprint/work using the information reflected in your Trello board.

> Inspired in this article of The Changelog: [https://changelog.com/trello-as-a-cms/]()

![Preview NewSprint](http://i.imgur.com/Szm1KNi.png)

## Installation

```
npm install newsprint -g
```

## Usage

```
newsprinte create [options]
```

### Options

- `-c, --config <path>`  path for the configuration file. defaults to `./config.json`
- `-p, --sprint <path>`  path for the sprint file. defaults to `./sprint.json`
- `-o, --output <path>`  path where save the newsletter html. defaults to `./newsletter.html`
- `-s, --send`           try to send by email the newsletter. `false` by default
- `-h, --help`           output usage information

### Examples

#### Create the newsletter in HTML
```
newsprinte create --config ./config.json
```

#### Create a custom newsletter in HTML
```
newsprinte create --config ./config.json --sprint ./sprint-06-04-2015.json
```

#### Create a custom newsletter in HTML and send it
```
newsprinte create --config ./config.json --sprint ./sprint.json --send
```

## Configuration

Before use the module, you need to create some configuration files to get the information from Trello, customize the newsletter and send it.

**Note**: You can get a dummy copy to use in the `tmpl` folder.

### config.json (required)

```js
{

	/**
	 * Trello configuration. Required
	 * To get this information you need to be logged into Trello: https://trello.com/login
	 */
	"trello": {

		/**
		 * To get the key, go to https://trello.com/app-key
		 */
		"key": "<key>",

		/**
		 * Then, to get the token,
		 * go to https://trello.com/1/connect?key=<your key>&name=NewSprint&response_type=token&expiration=never
		 * and click Allow.
		 * Note: You need insert your token in the URL
		 */
		"token": "<token>",

		/**
		 * Finally, go to your board and get the hash
		 * between https://trello.com/b/ and the name of the board from the URL.
		 * For example: for https://trello.com/b/nC8QJJoZ/trello-development the hash is nC8QJJoZ
		 */
		"board": "<board>"
	},

	/**
	 * Mailer configuration. Optional
	 * Internally the module use nodemailer: https://www.npmjs.com/package/nodemailer
	 */
	"mailer": {

		/**
		 * Supported services from this list: https://github.com/andris9/nodemailer-wellknown#supported-services
		 */
		"service": "<service>",

		/**
		 * User and pass to connect to the service
		 */
		"auth": {
			"user": "<user>",
			"pass": "<pass>"
		}

	}

}
```

### sprint.json (optional)
This file allows you customize the newsletter and choose to who send it.

```js
{

	/**
	 * Options to send the email properly
	 */
	"mail": {

		/**
		 * The subject. Required
		 */
		"subject": "Lorem Ipsum News",

		/**
		 * From who. Required
		 */
		"from": "Dude <dude@loremipsum.com>",

		/**
		 * To who. Required
		 */
		"to": "team@loremipsum.com",

		/**
		 * Whit copy. Optional
		 */
		"cc": "leader@loremipsum.com",

		/**
		 * Whit blind carbon copy. Optional
		 */
		"bcc": "ceo@loremipsum.com",

		/**
		 * Reply to. Optional
		 */
		"replyTo": "another.dude@loremipsum.com"

	},

	/**
	 * Options to customize the content of the newsletter. Optional
	 */
	"content": {

		/**
		 * The title of the newsletter. Optional
		 */
		"title": "Lorem Ipsum",

		/**
		 * Subtitle. Optional
		 */
		"subtitle": "Sprint Newsletter",

		/**
		 * An introduction. Optional
		 * Note: You can use markdown
		 */
		"intro": [
			"# Welcome!",
			"This is a simple introduction using markdown"
		],

		/**
		 * The order and lists from Trello where get the information. Optional
		 */
		"lists": [{

			/**
			 * The name of the list. Required
			 */
			"name": "Done",

			/**
			 * A description of the list. Optional
			 */
			"desc": "Finished tasks of the current sprint"

		}, {

			/**
			 * Another example
			 */
			"name": "In Progress",
			"desc": "Tasks in a early stage"

		}],

		/**
		 * A final text. Optional
		 * Note: You can use markdown
		 */
		"final": [
			"# And that's all!",
			"Cheers!"
		]

	},

	/**
	 * Options to customize the template of the newsletter. Optional
	 */
	"template": {

		/**
		 * Some styles. Optional
		 */
		"styles": {

			/**
			 * Styles for the header. Optional
			 */
			"header": {

				/**
				 * Background color. Optional
				 */
				"backgroundColor": "#0079bf",

				/**
				 * Color. Optional
				 */
				"color": "#FFF"

			},

			/**
			 * Styles for the headlines. Optional
			 */
			"headline": {

				/**
				 * Background color. Optional
				 */
				"backgroundColor": "#0079bf",

				/**
				 * Color. Optional
				 */
				"color": "#FFF"
				
			}
		}
	}
}
```

## TODO

- Allow custom templates
- Command to create the `config.json` and `sprint.json`
- Check if the newsletter is too heavy to send
- Read only cards with certains labels
- Tests

## CHANGELOG

- 05/03/2015: First version

## License

MIT
# NewSprint

Create and send a beautiful, mobile-friendly, newsletter  using  your Trello board.

## Resume

NewSprint allows you create a newsletter reading all (or some) lists/cars of Trello. The result can be [customized](https://github.com/rodati/newsprint#sprintjson-optional) and sent using one of [these services](https://github.com/andris9/nodemailer-wellknown#supported-services).

> Inspired by this article of The Changelog: [https://changelog.com/trello-as-a-cms/](https://changelog.com/trello-as-a-cms/)

## Example of newsletter

Click on the image to view the HTML generated.

[![Preview NewSprint](http://i.imgur.com/WbIBVzV.png)](https://cdn.rawgit.com/rodati/newsprint/master/example/output.html)

## Installation

```
npm install newsprint -g
```

## Usage

```
newsprint create [options]
```

#### Options

- `-c, --config <path>` path for the configuration file. defaults to `./config.json`
- `-p, --sprint <path>` path for the sprint file. defaults to `./sprint.json`
- `-o, --output <path>` path where save the newsletter html. defaults to `./newsletter.html`
- `-b, --open` after created, open the newsletter in the browser. false by default
- `-s, --send` try to send by email the newsletter. `false` by default
- `-t, --template <path>` path for the custom template file
- `-h, --help` output usage information

#### Examples

##### Create and open the newsletter
```
newsprint create --config config.json --open
```

##### Create a custom newsletter
```
newsprint create --config config.json --sprint sprint-06-04-2015.json
```

##### Create a custom newsletter and send it
```
newsprint create --config config.json --sprint sprint.json --template custom.html --send
```

## Configuration

Before use NewSprint, you need to create two configuration files: `config.json` and `sprint.json` (optional). 

### config.json

This file has some required configuration to get the information from Trello. 
All the options need to be inside a main object like [this](https://github.com/rodati/newsprint/tree/master/example/config.json):

```js
{
	"trello": {
		//Trello options
	},
	"mailer": {
		//Mailer options
	}
}
```

#### Options

##### trello
Required  
Type: `Object`  

Object with the configuration (`key`, `token` and `board`) to get the information from the Trello Board.

```js
"trello": {
	key: 'faeebf4e591574044cw11b', // Get a valid key from here https://trello.com/app-key
	token: '0c0934be87c137cf93', // To get the token, go to https://trello.com/1/connect?key=<KEY>&name=NewSprint&response_type=token&expiration=never and click Allow
	board: 'yleya8Pa' // Complete this getting the hash between https://trello.com/b/ and the name of the board from the board's URL
}
```

##### mailer
Optional  
Type: `Object`  

Optional object with the configuration to send the newsletter. Note: Internally the module use [Nodemailer](https://github.com/andris9/Nodemailer).

```js
"mailer": {
	service: 'SendGrid', // Complete this with one of this supported services from https://github.com/andris9/nodemailer-wellknown#supported-services
	auth: {
		user: 'ServiceUser',
		pass: 'ServicePassword'
	}
}
```

### sprint.json
This file is optional and allows you customize the newsletter and choose the way to send it.  All the options need to be inside a main object like [this](https://github.com/rodati/newsprint/tree/master/example/sprint.json):

```js
{
	"mail": {
		//Mail options
	},
	"content": {
		//Content options
	},
	"template": {
		//Styles options
	}
}
```

#### Options

##### mail
Optional  
Type: `Object`  

Options to send the email properly. Note: If `mailer` was setted, the `subject`, `from` and `to` params are required. 

```js
"mail": {
	"subject": "Lorem Ipsum - Weekly Resume",
	"from": "Dude <dude@loremipsum.com>",
	"to": "team@loremipsum.com",
	"cc": "leader@loremipsum.com",
	"bcc": "ceo@loremipsum.com",
	"replyTo": "another.dude@loremipsum.com"
}
```

##### content
Optional  
Type: `Object`  

Configuration to customize the content of the newsletter. 

```js
"content": {
	"title": "Lorem Ipsum", // The title of the newsletter
	"subtitle": "Weekly Resume", // The subtitle of the newsletter
	"intro": [ // A text to use as introduction
		"# Hi!", // Every item of the array is a paragraph
		"This is a simple introduction to our weekly newsletter." // And you can use markdown
	],
	"lists": [{ // An array of lists to get the information from the board
		"name": "Released (v0.2.x)", // The name of the list
		"desc": "New features and enhancements released", // A description for the list
		"labels": ["Enhancement", "New Feature"] // An array of labels to filter the cards of the list
	}, {
		"name": "In Progress",
		"desc": "Tasks in a early stage"
	}],
	"cards": {
		"labels": [{ // Configuration to extend/overwrite the labels of the board
			"name": "New", // The name/reference of the label in Trello
			"text": "New!" // A text to use as name in the newsletter
		}, {
			"name": "Important",
			"featured": true, // Highlight the card in the newsletter
			"show": false // Show or not the label in the newsletter
		}, {
			"name": "Enhancement",
			"color": "#2ba6cb" // A color for the label
		}]
	},
	"final": [ // A text to use as final
		"# And that's all, have a nice week!",
		"> The Lorem Ipsum Team"
	]
}
```

##### template
Optional  
Type: `Object`  

Configuration to customize the design of the template of the newsletter. Note: This object is passed directly to the template. [Example](https://github.com/rodati/newsprint/tree/master/example/simple-template.html) of custom template.

```js
{
	"template": {
		"styles": {
			"header": {
				"backgroundColor": "#89609E",
				"color": "#FFF"
			}
		}
	}
}
```

## FAQ

### Why `config.json` and `sprint.json` are separately?

The idea for `config.json` is have the technical configuration (Trello's keys, email auth, etc). And, for `sprint.json`, the customization configuration. So for that, both are in separate files.

### Where is the Changelog?

The changelog (and enhancements, new features and fixes of every release) are in the [Trello board of NewSprint](https://trello.com/b/DsSXlMFh/newsprint)

### License?

MIT

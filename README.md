# NewSprint

Create and send a beautiful, mobile-friendly, newsletter/resume of your current sprint/work using the information reflected in your Trello board.

## Resume

NewSprint allow you create a newsletter reading all (or specific) cards in Trello, each one with their title, link, cover, description, labels and members. The result can be customized ([more](https://github.com/rodati/newsprint#sprintjson-optional)) and be sent using one of [these services](https://github.com/andris9/nodemailer-wellknown#supported-services).

> This module is inspired by this article of The Changelog: [https://changelog.com/trello-as-a-cms/](https://changelog.com/trello-as-a-cms/)

## Preview

![Preview NewSprint](http://i.imgur.com/Szm1KNi.png)

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
- `-b, --open'` after created, open the newsletter in the browser. false by default
- `-s, --send` try to send by email the newsletter. `false` by default
- `-h, --help` output usage information

#### Examples

##### Create and open the newsletter
```
newsprinte create --config ./config.json --open
```

##### Create a custom newsletter
```
newsprinte create --config ./config.json --sprint ./sprint-06-04-2015.json
```

##### Create a custom newsletter and send it
```
newsprinte create --config ./config.json --sprint ./sprint.json --send
```

## Configuration

Before use NewSprint, you need to create some configuration files to get the information from Trello, create the newsletter and send it. 

### config.json

This file has some required configuration. You can get a dummy copy to use from [here](https://github.com/rodati/newsprint/tree/master/tmpl/config.json).

- **trello**: Required. **Important**: To get every configuration you need to be [logged into Trello](https://trello.com/login).
	- **key**: Complete this field getting the information from [here](https://trello.com/app-key).
	- **token**: To get the token, go to `https://trello.com/1/connect?key=<KEY>&name=NewSprint&response_type=token&expiration=never` and click Allow. **Important**: you need to replace `<KEY>` in the URL with the key obtained in the previous step.
	- **board**: Complete this getting the hash between `https://trello.com/b/` and the name of the board from the board's URL. For example, for `https://trello.com/b/nC8QJJoZ/trello-development`, the hash is `nC8QJJoZ`.

- **mailer**: Optional. Configuration to send the newsletter. 
	- **service**: Complete this with one the supported services from [this list](https://github.com/andris9/nodemailer-wellknown#supported-services).
	- **auth**: Authentification to connect to the supported service.
		- **user**: User to use.
		- **pass**: Password to use.


### sprint.json
This file is optional and allows you customize the newsletter and choose the way to send it. You can get a dummy copy to use from [here](https://github.com/rodati/newsprint/tree/master/tmpl/sprint.json).

- **mail**: Options to send the email properly. Some of these options are required if you want send the newsletter.
	- **subject**: Required.
	- **from**: Required.
	- **to**: Required. Multiple emails separated by commas.
	- **cc**: Optional. Multiple emails separated by commas.
	- **bcc**: Optional. Multiple emails separated by commas.
	- **replyTo**: Optional.

- **content**: Optional. Configuration to customize the content of the newsletter. 
	- **title**: Optional. The title of the newsletter.
	- **subtitle**: Optional. The subtitle of the newsletter.
	- **intro**: Optional. A text to use as introduction. Every item of the array is a paragraph. **Note**: You can use markdown.
	- **lists**: Optional. An array of lists where get the information.
		- **name**: Required. The name of the list.
		- **desc**: Optional. A description for the list.
		- **labels**: Optional. An array of labels to filter the cards of the list.
	- **final**: Optional. A text to use as final. Every item of the array is a paragraph. **Note**: You can use markdown.

- **template**: Optional. Configuration to customize the template of the newsletter.
	- **styles**: Optional. Styles configuration
		- **header**: Optional. Styles for the header.
			- **backgroundColor**: Optional. Background color.
			- **color**: Optional. Font color.
		- **headline**: Optional. Styles for the headlines.
			- **backgroundColor**: Optional. Background color.
			- **color**: Optional. Font color.


## TODO & CHANGELOG

For enhancements, new features and fixes of every release: [https://trello.com/b/DsSXlMFh/newsprint](https://trello.com/b/DsSXlMFh/newsprint)

## License

MIT
instapaper-export
=================

Export your instapaper archive from the command line.

## Requirements

* [NodeJS](http://nodejs.org/)

## Installation

	npm install
	
## Usage

Export archive and save it as instapaper.csv

	node app.js -u username@mail.com -p 123 instapaper.csv

Show help:

	node app.js --help

### Configuration

Read your credentials from the config file by copying and editing the default config file:

	cp config.json.default	config.json
	
Then just forget about the credentials parameters:

	node app.js instapaper.csv

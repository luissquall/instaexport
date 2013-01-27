var fs = require('fs'),
	request = require('request'),
	jsdom = require('jsdom'),
	optimist = require('optimist'),
	colors = require('colors'),
	config = fs.existsSync('./config.json') ? require('./config') : {};

var argv = optimist
	.usage('Usage $0 [-u username] [-p password] [file]')
	.alias({
		u: 'username',
		p: 'password'
	})
	.describe({
		u: 'Account email',
		p: 'Account password'
	})
	.argv;

var username = argv.username || config.username,
	password = argv.password || config.password,
	output = argv._[0] || 'instapaper-' + (new Date()).toISOString() + '.csv';

if (argv.help) {
	optimist.showHelp();
	process.exit();
}

var Instapaper = {
	URL: 'http://www.instapaper.com/',

	export: function() {
		this.logIn();
	},

	logIn: function() {
		var options = {
			url: this.URL + 'user/login',
			form: {
				username: username,
				password: password
			}
		};

		console.log('Logging in as ' + username + '...');
		request.post(options, this._onLogIn.bind(this));
	},

	exportCSV: function() {
		var self = this;
		request(this.URL + 'u', function(error, response, body) {
			var jquery = fs.readFileSync(__dirname + '/scripts/jquery.js').toString();

			// Parse document
			console.log('Parsing /u to extract form key...');
			jsdom.env({
				html: body,
				src: [jquery],
				done: function(errors, window) {
					var $ = window.$;
					if (!errors) {
						// Serialize form 
						body = $('form[action="/export/csv"]').serialize();
						if (body) {
							console.log('CSV Export Form unique key is ' + body);

							// Request csv backup and save it on disk
							console.log(('Requesting and saving CSV backup as ' + output + '...').green);
							request({
								url: self.URL + 'export/csv',
								method: 'POST',
								headers: {
									'Content-Type': 'application/x-www-form-urlencoded'
								},
								body: body
							}).pipe(fs.createWriteStream(output));
						} else {
							console.log('User is not authenticated or perhaps export key was not found...'.red)
						}
					} else {
						console.dir(errors);
					}
				}
			});					
		});
	},

	_onLogIn: function(error, response, body) {
		if (!error && response.statusCode == 200) {
			this.exportCSV();
		}
	}
};

Instapaper.export();
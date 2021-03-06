#!/usr/bin/env node

/**
 * External dependencies/
 */
var flatten = require('lodash.flatten'),
	fs = require('fs'),
	globby = require('globby'),
	path = require('path'),
	program = require('commander');

/**
 * Internal dependencies/
 */
var i18nWpPlugin = require('../cli');

/**
 * Internal variables/
 */
var keywords,
	format,
	projectName,
	outputFile,
	extras,
	arrayName,
	inputFiles,
	inputPaths,
	linesFile,
	lines;

function collect(val, memo) {
	memo.push(val);
	return memo;
}

function list(val) {
	return val.split(',');
}

program
	.version('0.0.1')
	.option('-k, --keywords <keyword,keyword>', 'keywords of the translate function', list)
	.option('-f, --format <format>', 'format of the output (php or pot)')
	.option('-o, --output-file <file>', 'output file for WP-style translation functions')
	.option(
		'-i, --input-file <filename>',
		'files in which to search for translation methods',
		collect,
		[]
	)
	.option('-p, --project-name <name>', 'name of the project')
	.option(
		'-e, --extra <name>',
		'Extra type of strings to add to the generated file (for now only `date` is available)'
	)
	.option(
		'-l, --lines-filter <file>',
		'Json file containing files and line numbers filters. Only included line numbers will be pased.'
	)
	.option(
		'-a, --array-name <name>',
		'name of variable in generated php file that contains array of method calls'
	)
	.option('-d, --domain-name <textdomain>', 'domain name to be used')
	.usage('-o outputFile -i inputFile -f format [inputFile ...]')
	.on('--help', function() {
		console.log('  Examples');
		console.log(
			'\n    $ i18n-wp-plugin -o ./outputFile.pot -i ./inputFile.js -i ./inputFile2.js'
		);
		console.log('');
	})
	.parse(process.argv);

keywords = program.keywords;
format = program.format;
outputFile = program.outputFile;
arrayName = program.arrayName;
projectName = program.projectName;
linesFile = program.linesFilter;
extras = Array.isArray(program.extra) ? program.extra : program.extra ? [program.extra] : null;
inputFiles = program.inputFile.length ? program.inputFile : program.args;
textDomain = program.domainName;

if (inputFiles.length === 0) {
	throw new Error('Error: You must enter the input file. Run `i18n-wp-plugin -h` for examples.');
}

inputPaths = globby.sync(inputFiles);

inputPaths.forEach(function(inputFile) {
	if (!fs.existsSync(inputFile)) {
		console.error('Error: inputFile, `' + inputFile + '`, does not exist');
	}
});

if (linesFile) {
	if (!fs.existsSync(linesFile)) {
		console.error('Error: linesFile, `' + linesFile + '`, does not exist');
	}

	lines = JSON.parse(fs.readFileSync(linesFile, 'utf8'));
	for (var line in lines) {
		lines[line] = lines[line].map(String);
		var modPath = path.relative(__dirname, line).replace(/^[\/.]+/, '');
		if (modPath !== line) {
			lines[modPath] = lines[line];
			delete lines[line];
		}
	}
}

var result = i18nWpPlugin({
	keywords: keywords,
	output: outputFile,
	phpArrayName: arrayName,
	inputPaths: inputPaths,
	format: format,
	extras: extras,
	lines: lines,
	projectName: projectName,
	textdomain: textDomain,
});

if (outputFile) {
	console.log('Done.');
} else {
	console.log(result);
}

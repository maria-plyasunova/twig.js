/*
 * Copyright 2011 Johannes M. Schmitt <schmittjoh@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('twig.Environment');

goog.require('twig');
goog.require('twig.Template');

goog.require('goog.object');

/**
 * @constructor
 */
twig.Environment = function() {
	/**
	 * @private
	 * @type {Object.<Function>}
	 */
	this.filters_ = {};
	
	/**
	 * @private
	 * @type {Object.<Function>}
	 */
	this.functions_ = {};
	
	/**
	 * @private
	 * @type {Object.<Function>}
	 */
	this.tests_ = {};
	
	/**
	 * @private
	 * @type {Object.<twig.Template>}
	 */
	this.createdTemplates_ = {};
	
	/**
	 * @private
	 * @type {Object}
	 */
	this.globals_ = {};
	
	/**
	 * @private
	 * @type {string}
	 */
	this.charset_ = 'UTF-8';
};

/**
 * Returns the rendered template.
 * 
 * @export
 * @param {Function} ctor The constructor of the template
 * @param {Object.<*>=} opt_context
 * @return {string}
 */
twig.Environment.prototype.render = function(ctor, opt_context) {
	var template = this.createTemplate(ctor);
	
	return template.render.call(template, twig.extend({}, this.globals_, opt_context || {}));
};

/**
 * Delegates to a filter function at runtime.
 * 
 * @param {string} name
 * @param {*} arg1
 * @param {...*} var_args
 * @return {*}
 */
twig.Environment.prototype.filter = function(name, arg1, var_args) {
	if (!goog.object.containsKey(this.filters_, name)) {
		throw Error("The filter '" + name + "' does not exist.");
	}
	
	return this.filters_[name].apply(null, Array.prototype.slice.call(arguments, 1));
};

/**
 * Delegates to a function at runtime.
 * 
 * @param {string} name
 * @param {*} arg1
 * @param {...*} var_args
 * @return {*}
 */
twig.Environment.prototype.invoke = function(name, arg1, var_args) {
	if (!goog.object.containsKey(this.functions_, name)) {
		throw Error("The function '" + name + "' does not exist.");
	}
	
	return this.functions_[name].apply(null, Array.prototype.slice.call(arguments, 1));
};

/**
 * Delegates to a test function at runtime.
 * 
 * @param {string} name
 * @param {*} arg1
 * @param {...*} var_args
 * @return {boolean}
 */
twig.Environment.prototype.test = function(name, arg1, var_args) {
	if (!goog.object.containsKey(this.tests_, name)) {
		throw Error("The test '" + name + "' does not exist.");
	}
	
	return /** @type {boolean} */ (
		this.tests_[name].apply(null, Array.prototype.slice.call(arguments, 1)));
};

/**
 * Sets a dynamic filter function at runtime.
 * 
 * @export
 * @param {string} name
 * @param {Function} filter
 */
twig.Environment.prototype.setFilter = function(name, filter) {
	this.filters_[name] = filter;
};

/**
 * Sets a dynamic function at runtime
 * 
 * @export
 * @param {string} name
 * @param {Function} func
 */
twig.Environment.prototype.setFunction = function(name, func) {
	this.functions_[name] = func;
};

/**
 * Sets a dynamic test function at runtime
 * 
 * @export
 * @param {string} name
 * @param {Function} func
 */
twig.Environment.prototype.setTest = function(name, func) {
	this.tests_[name] = func;
};

/**
 * Sets the global variables.
 * 
 * @export
 * @param {Object} globals
 */
twig.Environment.prototype.setGlobals = function(globals) {
	this.globals_ = globals;
};

/**
 * Sets a single global variable.
 * 
 * @export
 * @param {string} key
 * @param {*} value
 */
twig.Environment.prototype.setGlobal = function(key, value) {
	this.globals_[key] = value;
};

/**
 * @return {Object}
 */
twig.Environment.prototype.getGlobals = function() {
	return this.globals_;
};

/**
 * @return {string}
 */
twig.Environment.prototype.getCharset = function() {
	return this.charset_;
};

/**
 * @param {string} charset
 */
twig.Environment.prototype.setCharset = function(charset) {
	this.charset_ = charset;
};

/**
 * @param {Function} ctor
 * @return {twig.Template}
 */
twig.Environment.prototype.createTemplate = function(ctor) {
	var uid = goog.getUid(ctor);
	if (goog.object.containsKey(this.createdTemplates_, uid)) {
		return this.createdTemplates_[uid];
	}
	
	var template = /** @type {twig.Template} */ (new ctor(this));
	this.createdTemplates_[uid] = template;
	
	return template;
};

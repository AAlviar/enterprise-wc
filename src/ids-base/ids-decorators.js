/* eslint no-param-reassign: ["error", { "props": false }] */
const pjson = require('../../package.json');

/**
 * Add the version to the component
 * @param {number} value A number for testing;
 * @returns {Function} The decoratored function
 */
export function version(value) {
  return (target, property, descriptor) => { //eslint-disable-line
    target.prototype.version = value || pjson.version;
  };
}

/**
 * Custom Element Decorator
 * @param  {string} name The custom element name
 * @returns {Function} The decoratored function
 */
export function customElement(name) {
  return (target) => {
    customElements.define(name, target);
  };
}

/**
 * Mixin Decorator
 * @param  {object} obj The class/object to register
 * @returns {Function} The decoratored function
 */
export function mixin(obj) {
  return (target) => {
    Object.assign(target.prototype, obj);
  };
}
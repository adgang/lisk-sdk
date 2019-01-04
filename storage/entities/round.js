/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const assert = require('assert');
const { defaults, omit, pick } = require('lodash');
const filterType = require('../utils/filter_types');
const BaseEntity = require('./base_entity');

const defaultCreateValues = {};

const readOnlyFields = [];

/**
 * Round
 * @typedef {Object} Round
 * @property {string} address
 * @property {number} amount
 * @property {string} delegate
 * @property {number} round
 */

/**
 * Round Filters
 * @typedef {Object} filters.Round
 * @property {string} [address]
 * @property {string} [address_eql]
 * @property {string} [address_ne]
 * @property {string} [address_in]
 * @property {string} [address_like]
 * @property {number} [amount]
 * @property {number} [amount_eql]
 * @property {number} [amount_ne]
 * @property {number} [amount_gt]
 * @property {number} [amount_gte]
 * @property {number} [amount_lt]
 * @property {number} [amount_lte]
 * @property {number} [amount_in]
 * @property {string} [delegate]
 * @property {string} [delegate_eql]
 * @property {string} [delegate_ne]
 * @property {string} [delegate_in]
 * @property {string} [delegate_like]
 * @property {number} [round]
 * @property {number} [round_eql]
 * @property {number} [round_ne]
 * @property {number} [round_gt]
 * @property {number} [round_gte]
 * @property {number} [round_lt]
 * @property {number} [round_lte]
 * @property {number} [round_in]
 */

class Round extends BaseEntity {
	/**
	 * Constructor
	 * @param {BaseAdapter} adapter - Adapter to retrieve the data from
	 * @param {filters.Round} defaultFilters - Set of default filters applied on every query
	 */
	constructor(adapter, defaultFilters = {}) {
		super(adapter, defaultFilters);

		this.addField('address', 'string', { filter: filterType.TEXT });
		this.addField('amount', 'number', { filter: filterType.NUMBER });
		this.addField('delegate', 'string', { filter: filterType.TEXT });
		this.addField('round', 'number', { filter: filterType.NUMBER });

		const defaultSort = { sort: '' };
		this.extendDefaultOptions(defaultSort);

		this.SQLs = {
			select: this.adapter.loadSQLFile('rounds/get.sql'),
			create: this.adapter.loadSQLFile('rounds/create.sql'),
			update: this.adapter.loadSQLFile('rounds/update.sql'),
			updateOne: this.adapter.loadSQLFile('rounds/update_one.sql'),
			isPersisted: this.adapter.loadSQLFile('rounds/is_persisted.sql'),
			delete: this.adapter.loadSQLFile('rounds/delete.sql'),
		};
	}

	/**
	 * Get one round
	 *
	 * @param {filters.Round|filters.Round[]} [filters = {}]
	 * @param {Object} [options = {}] - Options to filter data
	 * @param {Number} [options.limit=10] - Number of records to fetch
	 * @param {Number} [options.offset=0] - Offset to start the records
	 * @param {Object} [tx] - Database transaction object
	 * @return {Promise.<Round, Error>}
	 */
	getOne(filters, options = {}, tx = null) {
		const expectedResultCount = 1;
		return this._getResults(filters, options, tx, expectedResultCount);
	}

	/**
	 * Get list of rounds
	 *
	 * @param {filters.Round|filters.Round[]} [filters = {}]
	 * @param {Object} [options = {}] - Options to filter data
	 * @param {Number} [options.limit=10] - Number of records to fetch
	 * @param {Number} [options.offset=0] - Offset to start the records
	 * @param {Object} [tx] - Database transaction object
	 * @return {Promise.<Round[], Error>}
	 */
	get(filters = {}, options = {}, tx = null) {
		return this._getResults(filters, options, tx);
	}

	_getResults(filters, options, tx, expectedResultCount = undefined) {
		this.validateFilters(filters);
		this.validateOptions(options);

		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);
		const parsedOptions = defaults(
			{},
			pick(options, ['limit', 'offset', 'sort']),
			pick(this.defaultOptions, ['limit', 'offset', 'sort'])
		);
		const parsedSort = this.parseSort(parsedOptions.sort);

		const params = {
			limit: parsedOptions.limit,
			offset: parsedOptions.offset,
			parsedSort,
			parsedFilters,
		};

		return this.adapter.executeFile(
			this.SQLs.select,
			params,
			{ expectedResultCount },
			tx
		);
	}

	/**
	 * Create round object
	 *
	 * @param {Object} data
	 * @param {Object} [_options]
	 * @param {Object} [tx] - Transaction object
	 * @return {null}
	 */
	// eslint-disable-next-line no-unused-vars
	create(data, _options = {}, tx = null) {
		assert(data, 'Must provide data to create account');
		assert(
			typeof data === 'object' || Array.isArray(data),
			'Data must be an object or array of objects'
		);

		let values;

		if (Array.isArray(data)) {
			values = data.map(item => ({ ...item }));
		} else if (typeof data === 'object') {
			values = [{ ...data }];
		}

		values = values.map(v => defaults(v, defaultCreateValues));
		const attributes = Object.keys(this.fields).filter(
			fieldname => fieldname !== 'id'
		);
		const createSet = this.getValuesSet(values, attributes);
		const fields = attributes
			.map(k => `"${this.fields[k].fieldName}"`)
			.join(',');

		return this.adapter.executeFile(
			this.SQLs.create,
			{ createSet, fields },
			{ expectedResultCount: 0 },
			tx
		);
	}

	/**
	 * Update the records based on given condition
	 *
	 * @param {filters.Round} [filters]
	 * @param {Object} data
	 * @param {Object} [options]
	 * @param {Object} [tx] - Transaction object
	 * @return {null}
	 */
	update(filters, data, _options, tx = null) {
		this.validateFilters(filters);
		const objectData = omit(data, readOnlyFields);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);
		const updateSet = this.getUpdateSet(objectData);

		const params = {
			...objectData,
			parsedFilters,
			updateSet,
		};

		return this.adapter.executeFile(
			this.SQLs.update,
			params,
			{ expectedResultCount: 0 },
			tx
		);
	}

	/**
	 * Update one record based on the condition given
	 *
	 * @param {filters.Round} filters
	 * @param {Object} data
	 * @param {Object} [options]
	 * @param {Object} [tx] - Transaction object
	 * @return {null}
	 */
	updateOne(filters, data, _options, tx = null) {
		this.validateFilters(filters);
		const objectData = omit(data, readOnlyFields);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);
		const updateSet = this.getUpdateSet(objectData);

		const params = {
			...objectData,
			parsedFilters,
			updateSet,
		};

		return this.adapter.executeFile(
			this.SQLs.updateOne,
			params,
			{ expectedResultCount: 0 },
			tx
		);
	}

	/**
	 * Check if the record exists with following conditions
	 *
	 * @param {filters.Round} filters
	 * @param {Object} [options]
	 * @param {Object} [tx]
	 * @returns {Promise.<boolean, Error>}
	 */
	isPersisted(filters, _options, tx = null) {
		const atLeastOneRequired = true;
		this.validateFilters(filters, atLeastOneRequired);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);

		return this.adapter
			.executeFile(
				this.SQLs.isPersisted,
				{ parsedFilters },
				{ expectedResultCount: 1 },
				tx
			)
			.then(result => result.exists);
	}

	/**
	 * Delete records with following conditions
	 *
	 * @param {filters.Round} filters
	 * @param {Object} [options]
	 * @param {Object} [tx]
	 * @returns {Promise.<boolean, Error>}
	 */
	delete(filters, _options, tx = null) {
		this.validateFilters(filters);
		const mergedFilters = this.mergeFilters(filters);
		const parsedFilters = this.parseFilters(mergedFilters);

		return this.adapter
			.executeFile(
				this.SQLs.delete,
				{ parsedFilters },
				{ expectedResultCount: 0 },
				tx
			)
			.then(result => result);
	}
}

module.exports = Round;

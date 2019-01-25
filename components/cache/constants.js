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

/**
 * Description of the namespace.
 *
 * @namespace constants
 * @memberof config
 * @see Parent: {@link component/cache}
 * @property {number} CACHE.KEYS.transactionCount
 * @property {number} CACHE.KEYS.blocksApi
 * @property {number} CACHE.KEYS.transactionsApi
 * @property {number} CACHE.KEYS.delegatesApi
 * @todo Add description for the namespace and the properties.
 */
module.exports = {
	CACHE: {
		KEYS: {
			transactionCount: 'transactionCount',
			blocksApi: '/api/blocks*',
			transactionsApi: '/api/transactions*',
			delegatesApi: '/api/delegates*',
		},
	},
};

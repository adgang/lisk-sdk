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

var Bignum = require('./bignum');
var slots = require('./slots');

var exceptions = global.exceptions;

/**
 * Sets round fees and rewards.
 *
 * @class
 * @memberof helpers
 * @requires helpers/bignum
 * @requires helpers/slots
 * @param {Object} scope
 * @see Parent: {@link helpers}
 * @todo Add description for the params
 */
// Constructor
function RoundChanges(scope) {
	this.roundFees = Math.floor(scope.roundFees) || 0;
	this.roundRewards = scope.roundRewards || [];

	// Apply exception for round if required
	if (exceptions.rounds[scope.round]) {
		// Apply rewards factor
		this.roundRewards.forEach((reward, index) => {
			this.roundRewards[index] = new Bignum(reward.toPrecision(15))
				.times(exceptions.rounds[scope.round].rewards_factor)
				.integerValue(Bignum.ROUND_FLOOR);
		});

		// Apply fees factor and bonus
		this.roundFees = new Bignum(this.roundFees.toPrecision(15))
			.times(exceptions.rounds[scope.round].fees_factor)
			.plus(exceptions.rounds[scope.round].fees_bonus)
			.integerValue(Bignum.ROUND_FLOOR);
	}
}

// Public methods
/**
 * Calculates rewards at round position.
 * Fees and feesRemaining based on slots.
 *
 * @param {number} index
 * @returns {Object} With fees, feesRemaining, rewards, balance
 * @todo Add description for the params
 */
RoundChanges.prototype.at = function(index) {
	var fees = new Bignum(this.roundFees.toPrecision(15))
		.dividedBy(slots.delegates)
		.integerValue(Bignum.ROUND_FLOOR);
	var feesRemaining = new Bignum(this.roundFees.toPrecision(15)).minus(
		fees.times(slots.delegates)
	);
	var rewards =
		new Bignum(this.roundRewards[index].toPrecision(15)).integerValue(
			Bignum.ROUND_FLOOR
		) || 0;

	return {
		fees: Number(fees.toFixed()),
		feesRemaining: Number(feesRemaining.toFixed()),
		rewards: Number(rewards.toFixed()),
		balance: Number(fees.add(rewards).toFixed()),
	};
};

module.exports = RoundChanges;

/*
 * Copyright © 2019 Lisk Foundation
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

jest.mock('fs-extra');
jest.mock('../../../../../src/controller/bus');
jest.mock('../../../../../src/controller/channels/in_memory_channel');

const fs = require('fs-extra');
const Controller = require('../../../../../src/controller/controller');
const Bus = require('../../../../../src/controller/bus');

describe('Controller Class', () => {
	// Arrange
	const appLabel = '#LABEL';
	const logger = {
		debug: jest.fn(),
		info: jest.fn(),
		error: jest.fn(),
	};
	const storage = {
		entities: {
			Migration: {
				applyAll: jest.fn(),
			},
		},
	};
	const channel = {
		registerToBus: jest.fn(),
	};
	const config = {
		components: '#CONFIG',
		tempPath: '/tmp/lisk',
	};
	const systemDirs = {
		temp: `${config.tempPath}/${appLabel}/`,
		sockets: `${config.tempPath}/${appLabel}/sockets`,
		pids: `${config.tempPath}/${appLabel}/pids`,
	};
	const configController = {
		...config,
		dirs: systemDirs,
		socketsPath: {
			root: `unix://${systemDirs.sockets}`,
			pub: `unix://${systemDirs.sockets}/lisk_pub.sock`,
			sub: `unix://${systemDirs.sockets}/lisk_sub.sock`,
			rpc: `unix://${systemDirs.sockets}/lisk_rpc.sock`,
		},
	};

	const params = {
		appLabel,
		config,
		logger,
		storage,
		channel,
	};

	let controller = null;

	beforeEach(() => {
		// Arrange
		fs.readdirSync = jest.fn().mockReturnValue([]);
		// Act
		controller = new Controller(params);
	});

	afterEach(async () => {
		// Act
		controller.cleanup();
	});

	describe('#constructor', () => {
		it('should initialize the instance correctly when valid arguments were provided.', () => {
			// Assert
			expect(controller.logger).toEqual(logger);
			expect(controller.appLabel).toEqual(appLabel);
			expect(controller.config).toEqual(configController);
			expect(controller.modules).toEqual({});
			expect(controller.channel).toBe(channel);
			expect(controller.storage).toBe(storage);
			expect(controller.bus).toBeNull();
		});
	});

	describe('#load', () => {
		it('should call initialization methods.', async () => {
			// Arrange
			const spies = {
				_setupDirectories: jest.spyOn(controller, '_setupDirectories'),
				_validatePidFile: jest.spyOn(controller, '_validatePidFile'),
				_setupBus: jest.spyOn(controller, '_setupBus'),
				_loadMigrations: jest
					.spyOn(controller, '_loadMigrations')
					.mockImplementation(),
				_loadModules: jest.spyOn(controller, '_loadModules'),
			};
			const modules = {};
			const moduleOptions = {};

			// Act
			await controller.load(modules, moduleOptions, {}, {});

			// Assert
			// Order of the functions matters in load method
			expect(spies._setupDirectories).toHaveBeenCalled();
			expect(spies._validatePidFile).toHaveBeenCalledAfter(
				spies._setupDirectories,
			);
			expect(spies._setupBus).toHaveBeenCalledAfter(spies._validatePidFile);
			expect(spies._loadMigrations).toHaveBeenCalledAfter(spies._setupBus);
			expect(spies._loadModules).toHaveBeenCalledAfter(spies._loadMigrations);
			expect(spies._loadModules).toHaveBeenCalledWith(modules, moduleOptions);
		});

		it('should log registered events and actions', async () => {
			// Arrange
			const modules = {};
			const moduleOptions = {};

			// Act
			await controller.load(modules, moduleOptions, {}, {});

			// Assert
			expect(logger.debug).toHaveBeenCalledWith(
				undefined,
				'Bus listening to events',
			);
			expect(logger.debug).toHaveBeenCalledWith(
				undefined,
				'Bus ready for actions',
			);
		});
	});

	describe('#setupDirectories', () => {
		it('should ensure directories exist', async () => {
			// Act
			await controller._setupDirectories();

			// Assert
			expect(fs.ensureDir).toHaveBeenCalledWith(systemDirs.temp);
			expect(fs.ensureDir).toHaveBeenCalledWith(systemDirs.sockets);
			expect(fs.ensureDir).toHaveBeenCalledWith(systemDirs.pids);
		});
	});

	describe('#_validatePidFile', () => {
		it.todo(
			'should call `fs.writeFile` function with pidPath, process.pid arguments.',
		);

		it.todo(
			'should throw `DuplicateAppInstanceError` if an application is already running with the given label.',
		);
	});

	describe('#_setupBus', () => {
		beforeEach(async () => {
			// Act
			controller._setupBus();
		});

		it('should set created `Bus` instance to `controller.bus` property.', () => {
			// Assert
			expect(Bus).toHaveBeenCalledWith(
				{
					wildcard: true,
					delimiter: ':',
					maxListeners: 1000,
				},
				logger,
				configController,
			);
			expect(controller.bus).toBeInstanceOf(Bus);
		});

		it('should call `controller.bus.setup()` method.', () => {
			// Assert
			expect(controller.bus.setup).toHaveBeenCalled();
		});

		it('should call `controller.channel.registerToBus()` method.', () => {
			// Assert
			expect(controller.bus.setup).toHaveBeenCalled();
		});

		it.todo('should log events if level is greater than info.');
	});

	describe('#_loadMigrations', () => {
		it.todo('should load migrations.');
	});

	describe('#_loadModules', () => {
		it('should load modules in sequence', async () => {
			// Arrange
			const spies = {
				_loadInMemoryModule: jest
					.spyOn(controller, '_loadInMemoryModule')
					.mockResolvedValue(''),
			};

			const modules = {
				dummyModule1: '#KLASS1',
				dummyModule2: '#KLASS2',
				dummyModule3: '#KLASS3',
			};

			const moduleOptions = {
				dummyModule1: '#OPTIONS1',
				dummyModule2: '#OPTIONS2',
				dummyModule3: '#OPTIONS3',
			};

			// Act
			await controller._loadModules(modules, moduleOptions);

			// Assert
			Object.keys(modules).forEach((alias, index) => {
				expect(spies._loadInMemoryModule).toHaveBeenNthCalledWith(
					index + 1,
					alias,
					modules[alias],
					moduleOptions[alias],
				);
			});
		});
	});

	describe('#_loadInMemoryModule', () => {
		it.todo('should call validateModuleSpec function.');

		describe('when creating channel', () => {
			it.todo(
				'should add created channel to `controller.modulesChannel` object',
			);

			it.todo(
				'should call `channel.registerToBus` method to register channel to the Bus.',
			);
		});

		describe('when creating module', () => {
			it.todo('should publish `loading:started` event before loading module.');
			it.todo('should call `module.load` method.');
			it.todo('should publish `loading:finished` event after loading module.');
			it.todo('should add module to `controller.modules` object.');
		});
	});
	describe('#unloadModules', () => {
		let stubs = {};
		beforeEach(() => {
			// Arrange
			stubs = {
				dummyModuleUnload1: jest.fn(),
				dummyModuleUnload2: jest.fn(),
				dummyModuleUnload3: jest.fn(),
			};

			controller.modules = {
				dummyModule1: {
					unload: stubs.dummyModuleUnload1,
				},
				dummyModule2: {
					unload: stubs.dummyModuleUnload2,
				},
				dummyModule3: {
					unload: stubs.dummyModuleUnload3,
				},
			};
		});

		it('should unload modules in sequence', async () => {
			// Act
			await controller.unloadModules();

			// Assert
			expect(stubs.dummyModuleUnload1).toHaveBeenCalled();
			expect(stubs.dummyModuleUnload2).toHaveBeenCalledAfter(
				stubs.dummyModuleUnload1,
			);
			expect(stubs.dummyModuleUnload3).toHaveBeenCalledAfter(
				stubs.dummyModuleUnload2,
			);
		});

		it('should unload all modules if modules argument was not provided', async () => {
			// Act
			await controller.unloadModules();

			// Assert
			expect(controller.modules).toEqual({});
		});

		it('should unload given modules if modules argument was provided', async () => {
			// Act
			await controller.unloadModules(['dummyModule1', 'dummyModule3']);

			// Assert
			expect(controller.modules).toEqual({
				dummyModule2: {
					unload: stubs.dummyModuleUnload2,
				},
			});
		});
	});
});

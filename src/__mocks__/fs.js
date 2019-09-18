const MemoryFs = require('metro-memory-fs');

module.exports = new MemoryFs({ cwd: '/current' });

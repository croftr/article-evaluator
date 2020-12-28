var reader = require('./pageReader');
var params = require('../params');
var logger = require('../logger');

module.exports = {

    processSources: async ({ tags }) => {

        for await (let param of params.sources) {
            logger.info('READ DOM FOR SOURCE >>>>>>> ' + param.id);
            const { baseUrl, pageUrl, id, description } = param;
            await reader.readDom({ tags, baseUrl, pageUrl, id, description });
        }

    }

}
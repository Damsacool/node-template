const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const retrieveCreatorCard = require('../../services/creator-cards/retrieve');
const CreatorCardMessages = require('../../messages/creator-card');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'retrieve-creator-card-completed');
  },
  async handler(rc, helpers) {
    const payload = {
      slug: rc.params.slug,
      access_code: rc.query.access_code,
    };

    const response = await retrieveCreatorCard(payload);

    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: CreatorCardMessages.RETRIEVED,
      data: response,
    };
  },
});
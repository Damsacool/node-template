const { createHandler } = require('@app-core/server');
const createCreatorCard = require('../../services/creator-cards/create');
const CreatorCardMessages = require('../../messages/creator-card');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const rawRes = rc.res || (helpers && helpers.res) || (rc.req && rc.req.res);

    try {
      const response = await createCreatorCard(rc.body);
      return {
        status: helpers.http_statuses.HTTP_200_OK,
        message: CreatorCardMessages.CREATED,
        data: response,
      };
    } catch (error) {
      let code = 'BAD_REQUEST';
      if (error.message?.includes('Slug')) code = 'SL02';
      else if (error.message?.includes('required')) code = 'AC01';
      else if (error.message?.includes('only be set')) code = 'AC05';

      if (rawRes) {
        rawRes.writeHead(400, { 'Content-Type': 'application/json' });
        rawRes.end(JSON.stringify({
          message: error.message,
          status: 'error',
          code: code
        }));
        return new Promise(() => {});
      }
      throw error;
    }
  },
});
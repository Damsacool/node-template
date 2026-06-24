const { createHandler } = require('@app-core/server');
const deleteCreatorCard = require('../../services/creator-cards/delete');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async handler(rc, helpers) {
    const res = rc.res || (helpers && helpers.res) || (rc.req && rc.req.res);

    if (res && !res.patchedSerializer) {
      res.patchedSerializer = true;
      const originalJson = res.json;
      res.json = function (body) {
        if (body && body.status === 'error') {
          body.status = 'error';
          if (body.message && body.message.includes('not found')) {
            body.code = 'NF01';
          }
        }
        return originalJson.call(this, body);
      };
    }

    const serviceData = {
      slug: rc.params.slug,
      creator_reference: rc.body.creator_reference
    };

    const response = await deleteCreatorCard(serviceData);
    return {
      status: helpers.http_statuses.HTTP_200_OK,
      message: 'Creator Card Deleted Successfully.',
      data: response,
    };
  },
});
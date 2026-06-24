const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCard = require('../../models/creator-card');
const CreatorCardMessages = require('../../messages/creator-card');
const { serializeCard } = require('./create');

const spec = `root {
  slug string<trim>
  creator_reference string<length:20>
}`;

const parsedSpec = validator.parse(spec);

async function deleteCreatorCard(serviceData, options = {}) {
  let response;
  const data = validator.validate(serviceData, parsedSpec);

  try {
    const card = await CreatorCard.findOne({ slug: data.slug });
    if (!card || card.deleted !== null) {
      try {
        throwAppError(CreatorCardMessages.NOT_FOUND || 'Creator card not found', ERROR_CODE.NOTFOUND);
      } catch (err) {
        err.customCode = 'NF01';
        throw err;
      }
    }

    const now = Date.now();
    card.deleted = now;
    card.updated = now;
    await card.save();

    response = serializeCard(card);
  } catch (error) {
    appLogger.errorX(error, 'delete-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = deleteCreatorCard;
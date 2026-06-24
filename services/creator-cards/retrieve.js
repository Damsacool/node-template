const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCard = require('../../models/creator-card');
const CreatorCardMessages = require('../../messages/creator-card');
const { serializeCard } = require('./create');

const spec = `root {
  slug string<trim>
  access_code? string<trim>
}`;

const parsedSpec = validator.parse(spec);

async function retrieveCreatorCard(serviceData, options = {}) {
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

    if (card.status === 'draft') {
      try {
        throwAppError(CreatorCardMessages.DRAFT_NOT_FOUND || 'Creator card not found', ERROR_CODE.NOTFOUND);
      } catch (err) {
        err.customCode = 'NF02';
        throw err;
      }
    }

    if (card.access_type === 'private' && !data.access_code) {
      try {
        throwAppError(CreatorCardMessages.ACCESS_CODE_MISSING || 'This card is private. An access code is required', ERROR_CODE.PERMERR);
      } catch (err) {
        err.customCode = 'AC03';
        throw err;
      }
    }

    if (card.access_type === 'private' && data.access_code !== card.access_code) {
      try {
        throwAppError(CreatorCardMessages.ACCESS_CODE_INVALID || 'Invalid access code', ERROR_CODE.PERMERR);
      } catch (err) {
        err.customCode = 'AC04';
        throw err;
      }
    }

    const serialized = serializeCard(card);
    delete serialized.access_code;

    response = serialized;
  } catch (error) {
    appLogger.errorX(error, 'retrieve-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = retrieveCreatorCard;
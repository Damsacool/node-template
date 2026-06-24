const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { ulid } = require('@app-core/randomness');
const { appLogger } = require('@app-core/logger');
const CreatorCard = require('../../models/creator-card');
const CreatorCardMessages = require('../../messages/creator-card');

const spec = `root {
  title string<trim|minLength:3|maxLength:100>
  description? string<trim|maxLength:500>
  slug? string<trim|minLength:5|maxLength:50>
  creator_reference string<length:20>
  links[]? {
    title string<trim|minLength:1|maxLength:100>
    url string<trim|maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|minLength:3|maxLength:100>
      description? string<trim|maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string
}`;

const parsedSpec = validator.parse(spec);

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '');
}

function randomSuffix() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function serializeCard(card) {
  const obj = card.toObject ? card.toObject() : { ...card };
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
}

async function createCreatorCard(serviceData, options = {}) {
  let response;
  const data = validator.validate(serviceData, parsedSpec);

  try {
    const accessType = data.access_type || 'public';

    // AC01: access_code required when private
    if (accessType === 'private' && !data.access_code) {
      try {
        throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED || 'access_code is required when access_type is private', ERROR_CODE.INVLDDATA);
      } catch (err) {
        err.customCode = 'AC01';
        throw err;
      }
    }

    // AC05: access_code must not be set on public cards
    if (accessType === 'public' && data.access_code) {
      try {
        throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED || 'access_code can only be set on private cards', ERROR_CODE.INVLDDATA);
      } catch (err) {
        err.customCode = 'AC05';
        throw err;
      }
    }

    if (data.access_code && !/^[a-zA-Z0-9]{6}$/.test(data.access_code)) {
      try {
        throwAppError('access_code must be exactly 6 alphanumeric characters', ERROR_CODE.INVLDDATA);
      } catch (err) {
        err.customCode = 'AC05';
        throw err;
      }
    }

    let slug = data.slug;

    if (slug) {
      const existing = await CreatorCard.findOne({ slug });
      if (existing) {
          const customErr = new Error(CreatorCardMessages.SLUG_TAKEN || 'Slug is already taken');
customErr.isApplicationError = true;
customErr.errorCode = 'INVLDDATA';
customErr.customCode = 'SL02';
throw customErr;
      }
    } else {
      slug = generateSlug(data.title);
      const existing = await CreatorCard.findOne({ slug });
      if (existing) {
          const customErr = new Error(CreatorCardMessages.SLUG_TAKEN || 'Slug is already taken');
customErr.isApplicationError = true;
customErr.errorCode = 'INVLDDATA';
customErr.customCode = 'SL02';
throw customErr;
      }
    }

    const now = Date.now();
    const card = await CreatorCard.create({
      _id: ulid(),
      title: data.title,
      description: data.description || null,
      slug,
      creator_reference: data.creator_reference,
      links: data.links || [],
      service_rates: data.service_rates || null,
      status: data.status,
      access_type: accessType,
      access_code: data.access_code || null,
      created: now,
      updated: now,
      deleted: null,
    });

    response = serializeCard(card);
  } catch (error) {
    appLogger.errorX(error, 'create-creator-card-error');
    throw error;
  }

  return response;
}

module.exports = createCreatorCard;
module.exports.serializeCard = serializeCard;
const CreatorCardMessages = {
  CREATED: 'Creator Card Created Successfully.',
  RETRIEVED: 'Creator Card Retrieved Successfully.',
  DELETED: 'Creator Card Deleted Successfully.',

  SLUG_TAKEN: 'Slug is already taken',
  ACCESS_CODE_REQUIRED: 'access_code is required when access_type is private',
  ACCESS_CODE_NOT_ALLOWED: 'access_code can only be set on private cards',
  ACCESS_CODE_MISSING: 'This card is private. An access code is required',
  ACCESS_CODE_INVALID: 'Invalid access code',
  NOT_FOUND: 'Creator card not found',
  DRAFT_NOT_FOUND: 'Creator card not found',
};

module.exports = CreatorCardMessages;
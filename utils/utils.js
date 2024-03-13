import sha1 from 'sha1';

// eslint-disable-next-line import/prefer-default-export
export const validatePassword = (plain, encrypted) => (sha1(plain) === encrypted);

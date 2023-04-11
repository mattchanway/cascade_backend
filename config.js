const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const CRYPTO_PASSWORD = process.env.CRYPTO_PASSWORD || 'secret-password';
const CRYPTO_ALGORITHM = process.env.CRYPTO_ALGORITHM || 'aes-192-cbc';
const SALT = process.env.SALT || '123456789101234567891234';

require("dotenv").config();

function getDatabaseUri(){
    return (process.env.NODE_ENV === "test") ? "cascade-test" : process.env.DATABASE_URL || "cascade";

}

module.exports = {
    CRYPTO_PASSWORD,
    SECRET_KEY,
    CRYPTO_ALGORITHM,
    SALT,
    getDatabaseUri
};
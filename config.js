const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const CRYPTO_PASSWORD = 'xq]nm,Vf7-$vU(HYwRc2s^W<nNZ@7,';
const CRYPTO_ALGORITHM = 'aes-192-cbc';
const SALT = 'yaMBf5=Jb(yNUnWJU5.0V?8G';

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
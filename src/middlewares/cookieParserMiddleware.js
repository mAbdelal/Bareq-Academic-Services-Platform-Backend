function parseCookies(req, res, next) {
    const rawCookies = req.headers.cookie; 
    req.cookies = {};

    if (rawCookies) {
        rawCookies.split(';').forEach(cookie => {
            const [key, value] = cookie.split('=').map(c => c.trim());
            req.cookies[key] = decodeURIComponent(value);
        });
    }

    next();
}

module.exports = parseCookies;
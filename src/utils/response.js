function success(res, data = {}, message = '') {
    return res.status(200).json({
        success: true,
        data,
        message
    });
}

module.exports = { success };

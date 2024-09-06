const { checkUserExists } = require('./db');

async function checkUserInitialization(res) {
    const initData = res.locals.initData;

    if (initData && initData.user && initData.user.id) {
        try {
            const userExists = await checkUserExists(initData.user.id);
            return { exists: userExists };
        } catch (error) {
            console.error('Error checking user existence:', error);
            throw new Error('Error checking user existence');
        }
    } else {
        console.log('Invalid initData:', initData);
        return { exists: false };
    }
}

module.exports = {
    checkUserInitialization,
};

const config = {
    activityCheckInterval: process.env.ACTIVITY_CHECK_INTERVAL || 1000,
    inactivityTimeout: process.env.INACTIVITY_TIMEOUT || (3 * 60 * 1000),
};yarn

module.exports = config;

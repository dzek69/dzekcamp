const aw = require("active-window");

const get = () => {
    return new Promise((resolve) => {
        aw.getActiveWindow(resolve);
    });
};

module.exports = get;

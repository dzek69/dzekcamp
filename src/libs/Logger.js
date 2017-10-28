const fs = require("fs");
const getWindowTitle = require("./getWindowTitle");

const loggingInterval = 5000;

const now = () => Date.now();
const date = () => (new Date()).toISOString().split('T')[0];

const tabLess = s => String(s).replace(/\t/, "");

class Logger {
    constructor() {
        this.state = false;

        this.logActivity = this.logActivity.bind(this);
    }

    setActivity(state) {
        if (this.state === state) {
            return false;
        }
        this.state = state;
        if (!state) {
            this.stopLogging();
            this.logBreak();
            return true;
        }
        this.startLogging();
        return true;
    }

    stopLogging() {
        clearInterval(this.interval);
    }

    startLogging() {
        this.interval = setInterval(this.logActivity, loggingInterval);
    }

    logBreak() {
        this.log("null");
    }

    log(... args) {
        const name = date() + ".txt";
        fs.writeFileSync(name, [now()].concat(args).map(tabLess).join("\t") + "\n", { flag: "a" });
    }

    async logActivity() {
        const window = await getWindowTitle();
        this.log(window.app, window.title);
    }
}

module.exports = Logger;

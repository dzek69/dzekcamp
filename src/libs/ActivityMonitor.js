const EventEmitter = require("eventemitter3");
const robotjs = require("robotjs");

const Timer = require("./Timer");
const getWindowTitle = require("./getWindowTitle");

const config = require("./../config");

class ActivityMonitor {
    constructor() {
        this.lastPosition = {};
        this.lastWindow = {};

        this.checkActivity = this.checkActivity.bind(this);
        this.handleTimeout = this.handleTimeout.bind(this);

        this.ee = new EventEmitter();
        this.timer = new Timer(this.handleTimeout, config.inactivityTimeout);

        this.timer.start();
        this.interval = setInterval(this.checkActivity, config.activityCheckInterval);
    }

    handleTimeout() {
        this.ee.emit("away");
    }

    handleActivity() {
        this.ee.emit("activity");
        this.timer.reset();
    }

    async checkActivity() {
        let activity = false;

        const pos = robotjs.getMousePos();
        if (pos.x !== this.lastPosition.x || pos.y !== this.lastPosition.y) {
            activity = true;
        }

        const window = await getWindowTitle();
        if (window.app !== this.lastWindow.app) {
            activity = true;
        }

        activity && this.handleActivity();
        this.lastPosition = pos;
        this.lastWindow = window;
    }

    on(event, listener) {
        this.ee.on(event, listener);
    }

    off(event, listener) {
        this.ee.off(event, listener);
    }
}

module.exports = ActivityMonitor;

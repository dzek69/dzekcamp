// @todo make a class out of it
function Timer(callback, t) {
    let time = t;
    let intervalId;
    let destroyed = false;

    this.stop = function() {
        if (intervalId) {
            clearTimeout(intervalId);
            intervalId = null;
        }
        return this;
    };

    this.start = function() {
        if (destroyed) {
            throw new Error("Trying to start a destroyed timer.");
        }
        if (!intervalId) {
            this.stop();
            intervalId = setTimeout(callback, time);
        }
        return this;
    };

    this.reset = function(newTime) {
        if (destroyed) {
            throw new Error("Trying to reset a destroyed timer.");
        }
        if (typeof newTime !== "undefined") {
            time = newTime;
        }
        return this.stop().start();
    };

    this.destroy = function() {
        destroyed = true;
        this.stop();
    };

    this.getTimeout = function() {
        return time;
    };
}

module.exports = Timer;

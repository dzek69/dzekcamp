const ActivityMonitor = require("./libs/ActivityMonitor");
const Logger = require("./libs/Logger");

module.exports = (async () => {
    const am = new ActivityMonitor();
    const log = new Logger();

    am.on("activity", () => {
        log.setActivity(true) && console.log("> Activity");
    });

    am.on("away", () => {
        log.setActivity(false) && console.log("> Away");
    });
});

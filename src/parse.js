const fs = require("fs");

const config = require("./config");

const BREAK_MIN_DIFF = config.inactivityTimeout / 1000;
const BREAK_TITLE = "PRZERWA";

const end = a => a[a.length - 1];

const secToHMS = sec_num => {
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours   = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
};

const timeFrom = val => (new Date(val * 1000)).toTimeString().split(" ")[0];

const group = activities => {
    const result = {
        breaks: {
            totalTime: 0,
            list: [],
        },
        work: {
            totalTime: 0,
            apps: {},
        },
    };

    activities.forEach((activity) => {
        if (activity.isBreak) {
            result.breaks.totalTime += activity.diff;
            result.breaks.list.push({
                from: timeFrom(activity.breakFrom),
                to: timeFrom(activity.breakFrom + activity.diff),
                time: activity.diff,
            });
            return;
        }
        if (!result.work.apps[activity.app]) {
            result.work.apps[activity.app] = {
                totalTime: 0,
                list: [],
            }
        }
        result.work.totalTime += activity.diff;

        const app = result.work.apps[activity.app];
        app.totalTime += activity.diff;
        app.list.push({
            from: timeFrom(activity.from),
            to: timeFrom(activity.from + activity.diff),
            time: activity.diff,
        });
    });

    return result;
};

const formatActivity = (activity) => {
    const from = timeFrom(activity.from);
    const to = timeFrom(activity.from + activity.diff);

    return `${from} - ${to}    ${activity.app}`;
};

module.exports = (async (argTime, argOption) => {
    const date = () => (new Date()).toISOString().split('T')[0];

    const name = argTime === "today" ? date() : argTime;

    const data = fs.readFileSync(name + ".txt").toString();
    const lines = data.split("\n").map(line => line.split("\t"));
    const linesCount = lines.length;

    let firstTime = "";

    const activities = [];
    for (let i = 0; i < linesCount; i++) {
        let current = lines[i];
        if (!current || !current[0]) {
            continue;
        }
        if (!firstTime) {
            firstTime = (new Date(+current[0])).toISOString().split('T')[1].split(".")[0];
        }

        current[0] = current[0].substr(0, 10);

        const prev = lines[i - 1];
        const timeDiff = prev ? current[0] - prev[0] : 0;
        const isBreak = !current[2] || timeDiff > BREAK_MIN_DIFF;

        const app = current[1];
        const title = current[2];

        const lastActivity = end(activities);

        if (lastActivity) {
            const isBreakToo = isBreak && lastActivity.isBreak;
            const isSameWindow = !isBreak && lastActivity.app === app && lastActivity.title === title;
            if (isBreakToo || isSameWindow) {
                lastActivity.diff += timeDiff;
                continue;
            }
        }

        activities.push({
            isBreak: isBreak,
            app: isBreak ? BREAK_TITLE : app,
            title: isBreak ? BREAK_TITLE : title,
            diff: timeDiff,
            from: Number(current[0]),
            breakFrom: isBreak && lastActivity && lastActivity.from,
        });
    }

    const grouped = group(activities);

    console.log();
    console.log("*** dzek camp ***");
    console.log();
    console.log("Wpisy od: " + firstTime);
    console.log();
    console.log("----------------");
    console.log();
    console.log("Praca łącznie:");
    console.log(secToHMS(grouped.work.totalTime));
    console.log();
    console.log("w tym:");

    for (const app in grouped.work.apps) {
        const time = grouped.work.apps[app].totalTime;
        console.log(app, ":", secToHMS(time));
    }

    console.log();
    console.log("----------------");
    console.log();
    console.log("Przerwy:");
    console.log(secToHMS(grouped.breaks.totalTime));
    console.log();
    console.log("w tym:");

    grouped.breaks.list.forEach(data => {
        console.log(data.from, "-", data.to, "(" + secToHMS(data.time) + ")");
    });

    if (argOption === "activities") {
        console.log();
        console.log("----------------");
        console.log();
        console.log("Wszystkie aktywności:");
        activities.forEach(a => !a.isBreak && console.log(formatActivity(a)));
    }
});

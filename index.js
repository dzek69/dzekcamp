#!/usr/bin/env node

if (process.argv[2]) {
    require("./src/parse")(process.argv[2]);
}
else {
    require("./src/run")();
}

if (process.env.NODE_ENV === "development") {
  module.exports = require("./build/index.server.development");
} else {
  module.exports = require("./build/index.server.production");
}

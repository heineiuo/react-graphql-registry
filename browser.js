if (process.env.NODE_ENV === "development") {
  module.exports = require("./build/index.browser.development");
} else {
  module.exports = require("./build/index.browser.production");
}

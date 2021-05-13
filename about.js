const { mustBeSignedIn } = require("./auth.js");
let aboutMessage = "Inventory Management 1.0";

function setAboutMessage(_, { message }) {
  return (aboutMessage = message);
}

function getAboutMessage() {
  return aboutMessage;
}

module.exports = {
  getAboutMessage,
  setAboutMessage: mustBeSignedIn(setAboutMessage),
};

var License = artifacts.require("License");

module.exports = function(deployer) {
  deployer.deploy(License,4);
};

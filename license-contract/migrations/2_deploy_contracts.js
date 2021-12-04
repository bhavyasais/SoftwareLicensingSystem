var SoftwareLicensingSystem = artifacts.require("SoftwareLicensingSystem");

module.exports = function(deployer) {
  deployer.deploy(SoftwareLicensingSystem,"SoftwareLicensingSystem","SLS",0);
};

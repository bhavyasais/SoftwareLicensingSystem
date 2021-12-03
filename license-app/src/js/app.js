App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  url: "http://127.0.0.1:7545",
  chairPerson: null,
  currentAccount: null,
  licenses: [
    {
      id: "0",
      name: "company-a",
      owner: "0xDFF10351C9567790152eB6e1b156809423308041",
    },
    {
      id: "1",
      name: "company-b",
      owner: "0x8e2d75B08D13987dfF742de47dB412E846d8e212",
    },
    {
      id: "2",
      name: "company-c",
      owner: "0x4b36472F71C26e9e7BAD146D09A234517AEa51C3",
    },
    {
      id: "3",
      name: "company-d",
      address: "0xD891Ae92031b6D38bB2eE6BD5528F5178e8adbcA",
    },
  ],

  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    ethereum.enable();

    App.populateAddress();
    App.populateLicenses();
    App.populateOwnerLicenses();
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("SoftwareLicensingSystem.json", function (data) {
      var licenseArtifact = data;
      App.contracts.license = TruffleContract(licenseArtifact);

      App.contracts.license.setProvider(App.web3Provider);

      return App.bindEvents();
    });
  },

  bindEvents: function () {
    $(document).on("click", "#register", function () {
      var ad = $("#enter_address").val();
      var fn = $("#fname").val();
      var ln = $("#lname").val();
      var org = $("#organization").val();
      App.handleRegister(ad, fn, ln, org);
    });

    $(document).on("click", "#selectLicense", function () {
      var customer = $("#enter_address").val();
      var obj = App.licenses.find(
        (element) =>
          element.id == document.getElementById("select_license").value
      );
      App.handleLicenseRequest(obj.id, obj.name, obj.owner, customer);
    });

    $(document).on("click", "#viewOwners", function () {
      var obj = App.licenses.find(
        (element) => element.id == document.getElementById("view_owner").value
      );
      App.viewOwner(obj.id);
    });

    $(document).on("click", "#makePayment", function () {
      var customer = $("#enter_address").val();
      var obj = App.licenses.find(
        (element) =>
          element.id == document.getElementById("select_license").value
      );
      console.log(customer,obj.owner);
      App.makePayment(customer,obj.owner,70);
    });
  },

  populateAddress: function () {
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts(
      (err, accounts) => {
        web3.eth.defaultAccount = web3.eth.accounts[0];
        jQuery.each(accounts, function (i) {
          if (web3.eth.coinbase != accounts[i]) {
            var optionElement =
              '<option value="' + accounts[i] + '">' + accounts[i] + "</option";
            jQuery("#enter_address").append(optionElement);
          }
        });
      }
    );
  },

  populateLicenses: function () {
    const lic = App.licenses;
    jQuery.each(lic, function (key, value) {
      var optionElement =
        '<option value="' + value.id + '">' + value.name + "</option";
      jQuery("#select_license").append(optionElement);
    });
  },

  populateOwnerLicenses: function () {
    const lic = App.licenses;
    jQuery.each(lic, function (key, value) {
      var optionElement =
        '<option value="' + value.id + '">' + value.name + "</option";
      jQuery("#view_owner").append(optionElement);
    });
  },

  handleRegister: function (addr, fname, lname, organization) {
    var licenseInstance;
    web3.eth.getAccounts(function (error, accounts) {
      var account = accounts[0];
      App.contracts.license
        .deployed()
        .then(function (instance) {
          licenseInstance = instance;
          return licenseInstance.registerCustomer(
            addr,
            fname,
            lname,
            organization,
            { from: account }
          );
        })
        .then(function (result, err) {
          if (result) {
            if (parseInt(result.receipt.status) == 1)
              alert(
                addr + " " + fname + " " + "registration done successfully"
              );
            else
              alert(addr + " registration not done successfully due to revert");
          } else {
            alert(addr + " registration failed");
          }
        });
    });
  },

  handleLicenseRequest: function (id, name, owner, customer) {
    var licenseInstance;
   web3.eth.getAccounts(function (error, accounts) {
      var account = accounts[0];
      App.contracts.license
        .deployed()
        .then(function (instance) {
          licenseInstance = instance;
          return licenseInstance.transferOwner(id, name, owner, customer,{from:account});
        })
        .then(function (result, err) {
          if (result) {
            if (parseInt(result.receipt.status) == 1)
              alert(name + " " + "license registration done successfully");
            else
              alert(addr + " registration not done successfully due to revert");
          } else {
            alert(addr + " registration failed");
          }
        });
    });
  },

  makePayment: function (customer, owner, amount) {
    var licenseInstance;
   web3.eth.getAccounts(function (error, accounts) {
      var account = accounts[0];
      App.contracts.license
        .deployed()
        .then(function (instance) {
          licenseInstance = instance;
          return licenseInstance.makePayment(customer, owner, amount,{from:account});
        })
        .then(function (result, err) {
          if (result) {
            if (parseInt(result.receipt.status) == 1)
              alert(name + " " + "payment successful");
            else
              alert(addr + " registration not done successfully due to revert");
          } else {
            alert(addr + " registration failed");
          }
        });
    });
  },

  viewOwner: function (id) {
    var bidInstance;
    App.contracts.license
      .deployed()
      .then(function (instance) {
        bidInstance = instance;
        return bidInstance.viewOwner(id);
      })
      .then(function (res) {
        alert("New owner is "+res);
      })
      .catch(function (err) {
        console.log(err.message);
        toastr["error"]("Error!");
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});

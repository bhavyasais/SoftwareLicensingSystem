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
    /*$.getJSON('../proposals.json', function(data) {
      var proposalsRow = $('#proposalsRow');
      var proposalTemplate = $('#proposalTemplate');

      for (i = 0; i < data.length; i ++) {
        proposalTemplate.find('.panel-title').text(data[i].name);
        proposalTemplate.find('img').attr('src', data[i].picture);
        proposalTemplate.find('.btn-license').attr('data-id', data[i].id);

        proposalsRow.append(proposalTemplate.html());
        App.names.push(data[i].name);
      }
    });*/
    return App.initWeb3();
  },

  initWeb3: function () {
    // Is there is an injected web3 instance?
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
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
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var licenseArtifact = data;
      App.contracts.license = TruffleContract(licenseArtifact);

      // Set the provider for our contract
      App.contracts.license.setProvider(App.web3Provider);

      //App.getChairperson();
      return App.bindEvents();
    });
  },

  bindEvents: function () {
    //$(document).on('click', '.btn-license', App.handleVote);
    //$(document).on('click', '#win-count', App.handleWinner);
    $(document).on("click", "#register", function () {
      var ad = $("#enter_address").val();
      var fn = $("#fname").val();
      var ln = $("#lname").val();
      var org = $("#organization").val();
      App.handleRegister(ad, fn, ln, org);
    });

    $(document).on("click", "#selectLicense", function () {
      //var name = $("#select_license").val();
      var customer = $("#enter_address").val();
      var obj = App.licenses.find(
        (element) =>
          element.id == document.getElementById("select_license").value
      );
      //console.log(obj.owner,customer);
      App.handleLicenseRequest(obj.id, obj.name, obj.owner, customer);
    });

    $(document).on("click", "#viewOwners", function () {
      //var name = $("#select_license").val();
      var obj = App.licenses.find(
        (element) => element.id == document.getElementById("view_owner").value
      );
      //console.log(obj);
      App.viewOwner(obj.id);
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
  /*getChairperson : function(){
    App.contracts.license.deployed().then(function(instance) {
      return instance;
    }).then(function(result) {
      App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
      App.currentAccount = web3.eth.coinbase;
      if(App.chairPerson != App.currentAccount){
        jQuery('#address_div').css('display','none');
        jQuery('#register_div').css('display','none');
      }else{
        jQuery('#address_div').css('display','block');
        jQuery('#register_div').css('display','block');
      }
    })
  },*/

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
          //console.log("seller "+owner+" customer "+customer)
          return licenseInstance.transferOwner(id, name, owner, customer,{from:account});
        })
        .then(function (result, err) {
          //console.log(result);
          if (result) {
            //console.log(App.licenses);
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

  viewOwner: function (id) {
    //console.log("To get owner"+" "+id);
    var bidInstance;
    App.contracts.license
      .deployed()
      .then(function (instance) {
        bidInstance = instance;
        return bidInstance.viewOwner(id);
      })
      .then(function (res) {
        alert("New owner is "+res);
        //var winner = res.logs[0].args.winner;
        //var highestBid = res.logs[0].args.highestBid.toNumber();
        //toastr.info("Highest bid is " + highestBid + "<br>" + "Winner is " + winner, "", { "iconClass": 'toast-info notification3' });
      })
      .catch(function (err) {
        console.log(err.message);
        toastr["error"]("Error!");
      });
  },

  /*handleVote: function(event) {
    event.preventDefault();
    var proposalId = parseInt($(event.target).data('id'));
    var licenseInstance;

    web3.eth.getAccounts(function(error, accounts) {
      var account = accounts[0];

      App.contracts.license.deployed().then(function(instance) {
        licenseInstance = instance;

        return licenseInstance.license(proposalId, {from: account});
      }).then(function(result, err){
            if(result){
                console.log(result.receipt.status);
                if(parseInt(result.receipt.status) == 1)
                alert(account + " voting done successfully")
                else
                alert(account + " voting not done successfully due to revert")
            } else {
                alert(account + " voting failed")
            }   
        });
    });
  },

  handleWinner : function() {
    console.log("To get winner");
    var licenseInstance;
    App.contracts.license.deployed().then(function(instance) {
      licenseInstance = instance;
      return licenseInstance.reqWinner();
    }).then(function(res){
    console.log(res);
      alert(App.names[res] + "  is the winner ! :)");
    }).catch(function(err){
      console.log(err.message);
    })
  }*/
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});

pragma solidity >=0.5.16;
contract License {

    struct Voter {                     
        uint weight;
        bool voted;
        uint vote;
    }

    struct Customer {                     
        bytes32 fname;
        bytes32 lname;
        bytes32 organization;
    }

    struct Proposal {                  
        uint voteCount;
    }

    address chairperson;
    mapping(address => Voter) voters;  
    mapping(address => Customer) customers;  
    Proposal[] proposals;

    
       //modifiers
   
    modifier onlyChair() 
     {require(msg.sender == chairperson);
      _;
     }
     
     modifier validVoter()
    {
        require(voters[msg.sender].weight > 0, "Not a Registered Voter");
        _;
    }

    constructor (uint numProposals) public  {
        chairperson = msg.sender;
        voters[chairperson].weight = 2; // weight 2 for testing purposes
        //proposals.length = numProposals; -- before 0.6.0
        for (uint prop = 0; prop < numProposals; prop ++)
            proposals.push(Proposal(0));
        
    }
    
     
    function register(address customer, bytes32 _fname, bytes32 _lname, bytes32 _organization) public onlyChair{
        customers[customer].fname = _fname;
        customers[customer].lname = _lname;
        customers[customer].organization = _organization;
    }

   
    function vote(uint toProposal) public  validVoter{
      
        Voter storage sender = voters[msg.sender];
        
        require (!sender.voted); 
        require (toProposal < proposals.length); 
        
        sender.voted = true;
        sender.vote = toProposal;   
        proposals[toProposal].voteCount += sender.weight;
    }

    function reqWinner() public view returns (uint winningProposal) {
       
        uint winningVoteCount = 0;
        for (uint prop = 0; prop < proposals.length; prop++) 
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                winningProposal = prop;
            }
       assert(winningVoteCount>=3);
    }
}
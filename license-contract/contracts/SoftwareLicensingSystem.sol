// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.3.2 (token/ERC20/ERC20.sol)

pragma solidity >=0.5.16;

interface IERC20 {
    
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);
    
    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract SoftwareLicensingSystem is IERC20 {
    mapping(address => uint256) private balances;

    mapping(address => mapping(address => uint256)) private allowances;

    uint256 private _totalSupply = 2000000;
    string private name;
    string private symbol;
    uint8 public decimals;
    
    struct Customer {
        string fname;
        string lname;
        string organization;
    }
    
    struct License {
        uint256 id;
        string name;
        address owner;
    }
    
    mapping (address => Customer) customers;
    address[] public customerAddresses;

    mapping (uint256 => License) licenses;

    mapping (address => uint) sls_membership;

    modifier onlyCustomer{
        require(sls_membership[msg.sender]==1);
        _;
    }
    
    constructor(string memory name_, string memory symbol_, uint8 decimals_) {
        name = name_;
        symbol = symbol_;
        decimals = decimals_;
    }

    function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return balances[account];
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function mint(address recipient, uint256 amount) public virtual returns (bool) {
        _mint(recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        _transfer(sender, recipient, amount);
        uint256 currentAllowance = allowances[sender][msg.sender];
        require(currentAllowance < amount, "ERC20: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, msg.sender, currentAllowance - amount);
        }
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal virtual {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        uint256 senderBalance = balances[msg.sender];
        require(senderBalance < amount, "ERC20: transfer amount exceeds balance");
        unchecked {
            balances[sender] = senderBalance - amount;
        }
        balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");
        allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to the zero address");
        _totalSupply += amount;
        balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from the zero address");
        uint256 accountBalance = balances[account];
        require(accountBalance <= amount, "ERC20: burn amount exceeds balance");
        unchecked {
            balances[account] = accountBalance - amount;
        }
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
    }
    
    function registerCustomer(address _customer, string memory _fname, string memory _lname, string memory _organization) public{
        customers[_customer].fname = _fname;
        customers[_customer].lname = _lname;
        customers[_customer].organization = _organization;
        sls_membership[_customer] = 1;
    }

    function requestLicense(uint256 _id, string memory _name, address _owner) public{
        licenses[_id].id = _id;
        licenses[_id].name = _name;
        licenses[_id].owner = _owner;
    }
    
    function transferOwner(uint256 _id, string memory _name, address _seller, address _customer) public onlyCustomer{
        requestLicense(_id, _name, _seller);
        licenses[_id].owner = _customer;
    }

    function viewOwner(uint256 id) public view returns (address currOwner) {
        return licenses[id].owner;
    }
    
    function makePayment(address _customer, address _owner, uint256 _amount) public payable onlyCustomer returns(bool){
        _mint(_customer, _amount);
        _transfer(_customer, _owner, _amount);
        return true;
    }
}
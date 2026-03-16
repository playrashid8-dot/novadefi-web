// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
function totalSupply() external view returns (uint256);
function balanceOf(address account) external view returns (uint256);
function transfer(address to, uint256 value) external returns (bool);
function allowance(address owner, address spender) external view returns (uint256);
function approve(address spender, uint256 value) external returns (bool);
function transferFrom(address from, address to, uint256 value) external returns (bool);
function decimals() external view returns (uint8);
}

library SafeERC20Lite {
function safeTransfer(IERC20 token, address to, uint256 value) internal {
bool ok = token.transfer(to, value);
require(ok, "SAFE_TRANSFER_FAILED");
}

function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {  
    bool ok = token.transferFrom(from, to, value);  
    require(ok, "SAFE_TRANSFER_FROM_FAILED");  
}

}

abstract contract ReentrancyGuard {
uint256 private constant _NOT_ENTERED = 1;
uint256 private constant _ENTERED = 2;
uint256 private _status = _NOT_ENTERED;

modifier nonReentrant() {  
    require(_status != _ENTERED, "REENTRANCY");  
    _status = _ENTERED;  
    _;  
    _status = _NOT_ENTERED;  
}

}

abstract contract OwnableLite {
address private _owner;

event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);  

constructor(address initialOwner) {  
    require(initialOwner != address(0), "OWNER_ZERO");  
    _owner = initialOwner;  
    emit OwnershipTransferred(address(0), initialOwner);  
}  

modifier onlyOwner() {  
    require(msg.sender == _owner, "NOT_OWNER");  
    _;  
}  

function owner() external view returns (address) {  
    return _owner;  
}  

function renounceOwnership() external onlyOwner {  
    emit OwnershipTransferred(_owner, address(0));  
    _owner = address(0);  
}  

function _transferOwnership(address newOwner) internal {  
    emit OwnershipTransferred(_owner, newOwner);  
    _owner = newOwner;  
}

}

contract NovaDeFi is ReentrancyGuard, OwnableLite {
using SafeERC20Lite for IERC20;

IERC20 public immutable stakingToken;  
uint8 public immutable tokenDecimals;  
uint256 public immutable UNIT;  

uint256 public constant BPS = 10_000;  
uint256 public constant treasury1Bps = 500; // 5%  
uint256 public constant treasury2Bps = 500; // 5%  

address public treasuryWallet1;  
address public treasuryWallet2;  

uint256[5] private _teamIncomeBps = [1000, 700, 500, 400, 300];  
uint256[5] private _teamLevelRequiredStake;  

uint256 private _planCount;  
uint256 private _salaryStageCount;  

uint256 private _totalActivePrincipal;  
uint256 private _totalActiveProfitLiability;  

struct Plan {  
    string name;  
    uint256 duration;  
    uint256 returnBps;  
    uint256 minStake;  
    uint256 maxStake;  
    uint256 maxActivePerUser;  
    bool enabled;  
}  

struct StakeInfo {  
    uint256 amount;  
    uint256 profit;  
    uint256 startTime;  
    uint256 endTime;  
    uint256 planId;  
    bool claimed;  
}  

struct SalaryStage {  
    uint256 requiredDirect;       // A only  
    uint256 requiredTeam;         // B+C+D+E only  
    uint256 requiredTeamVolume;   // A+B+C+D+E volume  
    uint256 requiredActiveStake;  // user's own active stake  
    uint256 reward;  
}  

struct UserMeta {  
    address referrer;  
    bool firstStakeDone;  

    uint256 activePrincipal;  
    uint256 totalStakedVolume;  
    uint256 rewardBalance;  

    uint256 directCount; // level 1 lifetime  
    uint256 teamCount;   // level 1..5 lifetime  
    uint256 teamVolume;  // level 1..5 lifetime volume  

    uint256 level1Count;  
    uint256 level2Count;  
    uint256 level3Count;  
    uint256 level4Count;  
    uint256 level5Count;  

    uint256 salaryStageClaimed;  

    // snapshots for fresh salary qualification  
    uint256 salaryDirectSnapshot;  
    uint256 salaryTeamSnapshot;   // non-direct team snapshot  
    uint256 salaryVolumeSnapshot;  
}  

mapping(uint256 => Plan) private _plans;  
mapping(uint256 => SalaryStage) private _salaryStages;  
mapping(address => StakeInfo[]) private _stakes;  
mapping(address => mapping(uint256 => uint256)) private _userActivePlanStakeCount;  
mapping(address => UserMeta) private _userMeta;  

event TreasuryWalletsUpdated(address indexed treasury1, address indexed treasury2);  

event PlanSet(  
    uint256 indexed planId,  
    string name,  
    uint256 duration,  
    uint256 returnBps,  
    uint256 minStake,  
    uint256 maxStake,  
    uint256 maxActivePerUser,  
    bool enabled  
);  

event SalaryStageSet(  
    uint256 indexed stageId,  
    uint256 requiredDirect,  
    uint256 requiredTeam,  
    uint256 requiredTeamVolume,  
    uint256 requiredActiveStake,  
    uint256 reward  
);  

event ReferrerBound(address indexed user, address indexed referrer);  

event StakeCreated(  
    address indexed user,  
    uint256 indexed stakeIndex,  
    uint256 indexed planId,  
    uint256 amount,  
    uint256 profit,  
    uint256 startTime,  
    uint256 endTime  
);  

event TeamIncomeCredited(address indexed fromUser, address indexed leader, uint256 indexed level, uint256 amount);  
event SalaryRewardCredited(address indexed user, uint256 indexed stageId, uint256 reward);  
event StakeClaimed(address indexed user, uint256 indexed stakeIndex, uint256 capital, uint256 profit);  
event RewardsClaimed(address indexed user, uint256 amount);  

constructor(  
    address initialOwner,  
    address token_,  
    address treasury1_,  
    address treasury2_  
) OwnableLite(initialOwner) {  
    require(token_ != address(0), "TOKEN_ZERO");  
    require(treasury1_ != address(0) && treasury2_ != address(0), "TREASURY_ZERO");  

    stakingToken = IERC20(token_);  
    treasuryWallet1 = treasury1_;  
    treasuryWallet2 = treasury2_;  

    uint8 d = IERC20(token_).decimals();  
    require(d <= 18, "UNSUPPORTED_DECIMALS");  
    tokenDecimals = d;  
    UNIT = 10 ** d;  

    // Team income minimum stake thresholds  
    _teamLevelRequiredStake[0] = 100 * UNIT;  // L1  
    _teamLevelRequiredStake[1] = 200 * UNIT;  // L2  
    _teamLevelRequiredStake[2] = 300 * UNIT;  // L3  
    _teamLevelRequiredStake[3] = 500 * UNIT;  // L4  
    _teamLevelRequiredStake[4] = 700 * UNIT;  // L5  

    // 4 plans only  
    _setPlan(0, "Basic", 7 days, 400, 10 * UNIT, 5000 * UNIT, 4, true);  
    _setPlan(1, "Silver", 15 days, 1200, 50 * UNIT, 10000 * UNIT, 5, true);  
    _setPlan(2, "Gold", 30 days, 2600, 100 * UNIT, 20000 * UNIT, 6, true);  
    _setPlan(3, "VIP", 60 days, 6000, 200 * UNIT, 30000 * UNIT, 7, true);  

    // Fresh qualification salary system  
    _setSalaryStage(1, 5, 15, 2000 * UNIT, 100 * UNIT, 30 * UNIT);  
    _setSalaryStage(2, 10, 35, 5000 * UNIT, 300 * UNIT, 80 * UNIT);  
    _setSalaryStage(3, 25, 100, 15000 * UNIT, 500 * UNIT, 250 * UNIT);  
    _setSalaryStage(4, 45, 150, 50000 * UNIT, 2000 * UNIT, 500 * UNIT);  
    _setSalaryStage(5, 80, 500, 150000 * UNIT, 5000 * UNIT, 1500 * UNIT);  
}  

// ==================================================  
// OWNER  
// ==================================================  

function setTreasuryWallets(address treasury1_, address treasury2_) external onlyOwner {  
    require(treasury1_ != address(0) && treasury2_ != address(0), "TREASURY_ZERO");  
    treasuryWallet1 = treasury1_;  
    treasuryWallet2 = treasury2_;  
    emit TreasuryWalletsUpdated(treasury1_, treasury2_);  
}  

// ==================================================  
// USER FUNCTIONS  
// ==================================================  

function stake(uint256 planId, uint256 amount, address referrer) external nonReentrant {  
    Plan memory p = _plans[planId];  

    require(p.enabled, "PLAN_DISABLED");  
    require(amount >= p.minStake, "BELOW_MIN");  
    require(amount <= p.maxStake, "ABOVE_MAX");  
    require(_userActivePlanStakeCount[msg.sender][planId] < p.maxActivePerUser, "PLAN_LIMIT_REACHED");  

    uint256 beforeBal = stakingToken.balanceOf(address(this));
stakingToken.safeTransferFrom(msg.sender, address(this), amount);
uint256 afterBal = stakingToken.balanceOf(address(this));
require(afterBal - beforeBal == amount, "FEE_ON_TRANSFER_NOT_ALLOWED");  

    _bindReferrer(msg.sender, referrer);  

    uint256 profit = (amount * p.returnBps) / BPS;  

    if (!_userMeta[msg.sender].firstStakeDone) {  
        _userMeta[msg.sender].firstStakeDone = true;  
    }  

    uint256 treasury1Amount = (amount * treasury1Bps) / BPS;  
    uint256 treasury2Amount = (amount * treasury2Bps) / BPS;  

    _totalActivePrincipal += amount;  
    _totalActiveProfitLiability += profit;  

    _userMeta[msg.sender].activePrincipal += amount;  
    _userMeta[msg.sender].totalStakedVolume += amount;  
    _userActivePlanStakeCount[msg.sender][planId] += 1;  

    _creditTeamIncome(msg.sender, profit);  

    _stakes[msg.sender].push(  
        StakeInfo({  
            amount: amount,  
            profit: profit,  
            startTime: block.timestamp,  
            endTime: block.timestamp + p.duration,  
            planId: planId,  
            claimed: false  
        })  
    );  

    _addTeamVolume(msg.sender, amount);  

    stakingToken.safeTransfer(treasuryWallet1, treasury1Amount);  
    stakingToken.safeTransfer(treasuryWallet2, treasury2Amount);  

    emit StakeCreated(  
        msg.sender,  
        _stakes[msg.sender].length - 1,  
        planId,  
        amount,  
        profit,  
        block.timestamp,  
        block.timestamp + p.duration  
    );  
}  

function claimStake(uint256 stakeIndex) external nonReentrant {  
    require(stakeIndex < _stakes[msg.sender].length, "INVALID_STAKE");  

    StakeInfo storage s = _stakes[msg.sender][stakeIndex];  
    require(!s.claimed, "ALREADY_CLAIMED");  
    require(block.timestamp >= s.endTime, "NOT_MATURED");  

    s.claimed = true;  

    _userActivePlanStakeCount[msg.sender][s.planId] -= 1;  
    _userMeta[msg.sender].activePrincipal -= s.amount;  

    _totalActivePrincipal -= s.amount;  
    _totalActiveProfitLiability -= s.profit;  

    uint256 payout = s.amount + s.profit;  
    stakingToken.safeTransfer(msg.sender, payout);  

    emit StakeClaimed(msg.sender, stakeIndex, s.amount, s.profit);  
}  

function claimRewards() external nonReentrant {  
    uint256 amount = _userMeta[msg.sender].rewardBalance;  
    require(amount > 0, "NO_REWARDS");  

    _userMeta[msg.sender].rewardBalance = 0;  

    stakingToken.safeTransfer(msg.sender, amount);  

    emit RewardsClaimed(msg.sender, amount);  
}  

function claimSalary() external nonReentrant {  
    UserMeta storage u = _userMeta[msg.sender];  
    uint256 nextStage = u.salaryStageClaimed + 1;  

    require(nextStage > 0 && nextStage <= _salaryStageCount, "NO_NEXT_STAGE");  

    SalaryStage memory s = _salaryStages[nextStage];  

    uint256 nonDirectTeam = u.teamCount - u.directCount;  
    uint256 freshDirect = u.directCount - u.salaryDirectSnapshot;  
    uint256 freshTeamOnly = nonDirectTeam - u.salaryTeamSnapshot;  
    uint256 freshVolume = u.teamVolume - u.salaryVolumeSnapshot;  

    require(u.activePrincipal >= s.requiredActiveStake, "NOT_ACTIVE_STAKER");  
    require(freshDirect >= s.requiredDirect, "DIRECT_NOT_MET");  
    require(freshTeamOnly >= s.requiredTeam, "TEAM_NOT_MET");  
    require(freshVolume >= s.requiredTeamVolume, "VOLUME_NOT_MET");  

    u.salaryStageClaimed = nextStage;  
    u.rewardBalance += s.reward;  

    u.salaryDirectSnapshot = u.directCount;  
    u.salaryTeamSnapshot = nonDirectTeam;  
    u.salaryVolumeSnapshot = u.teamVolume;  

    emit SalaryRewardCredited(msg.sender, nextStage, s.reward);  
}  

// ==================================================  
// IMPORTANT READ FUNCTIONS ONLY  
// ==================================================  

function planCount() external view returns (uint256) {  
    return _planCount;  
}  

function plans(uint256 planId) external view returns (  
    string memory name,  
    uint256 duration,  
    uint256 returnBps,  
    uint256 minStake,  
    uint256 maxStake,  
    uint256 maxActivePerUser,  
    bool enabled  
) {  
    Plan memory p = _plans[planId];  
    return (  
        p.name,  
        p.duration,  
        p.returnBps,  
        p.minStake,  
        p.maxStake,  
        p.maxActivePerUser,  
        p.enabled  
    );  
}  

function getUserStakes(address user) external view returns (StakeInfo[] memory) {  
    return _stakes[user];  
}  

function getStakeCount(address user) external view returns (uint256) {  
    return _stakes[user].length;  
}  

function getRewardBalance(address user) external view returns (uint256) {  
    return _userMeta[user].rewardBalance;  
}  

function userMeta(address user) external view returns (  
    address referrer,  
    bool firstStakeDone,  
    uint256 activePrincipal,  
    uint256 totalStakedVolume,  
    uint256 rewardBalance,  
    uint256 directCount,  
    uint256 teamCount,  
    uint256 teamVolume,  
    uint256 salaryStageClaimed  
) {  
    UserMeta memory u = _userMeta[user];  
    return (  
        u.referrer,  
        u.firstStakeDone,  
        u.activePrincipal,  
        u.totalStakedVolume,  
        u.rewardBalance,  
        u.directCount,  
        u.teamCount,  
        u.teamVolume,  
        u.salaryStageClaimed  
    );  
}  

function getTeamLevels(address user)  
    external  
    view  
    returns (  
        uint256 level1,  
        uint256 level2,  
        uint256 level3,  
        uint256 level4,  
        uint256 level5  
    )  
{  
    UserMeta storage u = _userMeta[user];  
    return (  
        u.level1Count,  
        u.level2Count,  
        u.level3Count,  
        u.level4Count,  
        u.level5Count  
    );  
}  

function canClaimSalary(address user) external view returns (bool) {  
    UserMeta storage u = _userMeta[user];  
    uint256 nextStage = u.salaryStageClaimed + 1;  
    if (nextStage == 0 || nextStage > _salaryStageCount) return false;  

    SalaryStage memory s = _salaryStages[nextStage];  

    uint256 nonDirectTeam = u.teamCount - u.directCount;  
    uint256 freshDirect = u.directCount - u.salaryDirectSnapshot;  
    uint256 freshTeamOnly = nonDirectTeam - u.salaryTeamSnapshot;  
    uint256 freshVolume = u.teamVolume - u.salaryVolumeSnapshot;  

    return (  
        u.activePrincipal >= s.requiredActiveStake &&  
        freshDirect >= s.requiredDirect &&  
        freshTeamOnly >= s.requiredTeam &&  
        freshVolume >= s.requiredTeamVolume  
    );  
}  

function getNextSalaryRequirement(address user)
    external
    view
    returns (
        uint256 nextStage,
        uint256 requiredDirect,
        uint256 requiredTeam,
        uint256 requiredTeamVolume,
        uint256 requiredActiveStake,
        uint256 reward,
        uint256 currentFreshDirect,
        uint256 currentFreshTeam,
        uint256 currentFreshVolume,
        bool claimable
    )
{
    UserMeta storage u = _userMeta[user];
    nextStage = u.salaryStageClaimed + 1;

    if (nextStage == 0 || nextStage > _salaryStageCount) {
        return (0, 0, 0, 0, 0, 0, 0, 0, 0, false);
    }

    SalaryStage storage s = _salaryStages[nextStage];

    requiredDirect = s.requiredDirect;
    requiredTeam = s.requiredTeam;
    requiredTeamVolume = s.requiredTeamVolume;
    requiredActiveStake = s.requiredActiveStake;
    reward = s.reward;

    currentFreshDirect = u.directCount - u.salaryDirectSnapshot;
    currentFreshTeam = (u.teamCount - u.directCount) - u.salaryTeamSnapshot;
    currentFreshVolume = u.teamVolume - u.salaryVolumeSnapshot;

    claimable =
        u.activePrincipal >= requiredActiveStake &&
        currentFreshDirect >= requiredDirect &&
        currentFreshTeam >= requiredTeam &&
        currentFreshVolume >= requiredTeamVolume;
}  

function previewTeamIncome(address user, uint256 expectedProfit)  
    external  
    view  
    returns (uint256[5] memory rewards, uint256 total)  
{  
    address current = _userMeta[user].referrer;  

    for (uint256 i = 0; i < 5; i++) {  
        if (current == address(0)) break;  
        if (_userMeta[current].activePrincipal >= _teamLevelRequiredStake[i]) {  
            rewards[i] = (expectedProfit * _teamIncomeBps[i]) / BPS;  
            total += rewards[i];  
        }  
        current = _userMeta[current].referrer;  
    }  
}  

function salaryStages(uint256 stageId) external view returns (  
    uint256 requiredDirect,  
    uint256 requiredTeam,  
    uint256 requiredTeamVolume,  
    uint256 requiredActiveStake,  
    uint256 reward  
) {  
    SalaryStage memory s = _salaryStages[stageId];  
    return (  
        s.requiredDirect,  
        s.requiredTeam,  
        s.requiredTeamVolume,  
        s.requiredActiveStake,  
        s.reward  
    );  
}  

// ==================================================  
// INTERNAL LOGIC  
// ==================================================  

function _bindReferrer(address user, address referrer) internal {  
    UserMeta storage u = _userMeta[user];  

    if (u.firstStakeDone) return;  
    if (referrer == address(0) || referrer == user) return;  

    require(_userMeta[referrer].totalStakedVolume > 0, "INVALID_REFERRER");  

    address currentCheck = referrer;  
    while (currentCheck != address(0)) {  
        require(currentCheck != user, "REFERRAL_CYCLE");  
        currentCheck = _userMeta[currentCheck].referrer;  
    }  

    u.referrer = referrer;  
    emit ReferrerBound(user, referrer);  

    address current = referrer;  
    for (uint256 i = 0; i < 5; i++) {  
        if (current == address(0)) break;  

        if (i == 0) {  
            _userMeta[current].directCount += 1;  
            _userMeta[current].level1Count += 1;  
        } else if (i == 1) {  
            _userMeta[current].level2Count += 1;  
        } else if (i == 2) {  
            _userMeta[current].level3Count += 1;  
        } else if (i == 3) {  
            _userMeta[current].level4Count += 1;  
        } else if (i == 4) {  
            _userMeta[current].level5Count += 1;  
        }  

        _userMeta[current].teamCount += 1;  
        current = _userMeta[current].referrer;  
    }  
}  

function _addTeamVolume(address user, uint256 amount) internal {  
    address current = _userMeta[user].referrer;  
    for (uint256 i = 0; i < 5; i++) {  
        if (current == address(0)) break;  
        _userMeta[current].teamVolume += amount;  
        current = _userMeta[current].referrer;  
    }  
}  

function _creditTeamIncome(address user, uint256 profit) internal {  
    address current = _userMeta[user].referrer;  

    for (uint256 i = 0; i < 5; i++) {  
        if (current == address(0)) break;  

        if (_userMeta[current].activePrincipal >= _teamLevelRequiredStake[i]) {  
            uint256 reward = (profit * _teamIncomeBps[i]) / BPS;  

            if (reward > 0) {  
                _userMeta[current].rewardBalance += reward;  
                emit TeamIncomeCredited(user, current, i + 1, reward);  
            }  
        }  

        current = _userMeta[current].referrer;  
    }  
}  

function _setPlan(  
    uint256 planId,  
    string memory name,  
    uint256 duration,  
    uint256 returnBps,  
    uint256 minStake,  
    uint256 maxStake,  
    uint256 maxActivePerUser,  
    bool enabled  
) internal {  
    require(duration > 0, "BAD_DURATION");  
    require(returnBps > 0, "BAD_RETURN");  
    require(minStake > 0, "BAD_MIN");  
    require(maxStake >= minStake, "BAD_MAX");  
    require(maxActivePerUser > 0, "BAD_LIMIT");  

    _plans[planId] = Plan({  
        name: name,  
        duration: duration,  
        returnBps: returnBps,  
        minStake: minStake,  
        maxStake: maxStake,  
        maxActivePerUser: maxActivePerUser,  
        enabled: enabled  
    });  

    if (planId >= _planCount) {  
        _planCount = planId + 1;  
    }  

    emit PlanSet(  
        planId,  
        name,  
        duration,  
        returnBps,  
        minStake,  
        maxStake,  
        maxActivePerUser,  
        enabled  
    );  
}  

function _setSalaryStage(  
    uint256 stageId,  
    uint256 requiredDirect,  
    uint256 requiredTeam,  
    uint256 requiredTeamVolume,  
    uint256 requiredActiveStake,  
    uint256 reward  
) internal {  
    require(stageId > 0, "BAD_STAGE");  
    require(reward > 0, "BAD_REWARD");  

    _salaryStages[stageId] = SalaryStage({  
        requiredDirect: requiredDirect,  
        requiredTeam: requiredTeam,  
        requiredTeamVolume: requiredTeamVolume,  
        requiredActiveStake: requiredActiveStake,  
        reward: reward  
    });  

    if (stageId > _salaryStageCount) {  
        _salaryStageCount = stageId;  
    }  

    emit SalaryStageSet(  
        stageId,  
    
    requiredDirect,  
        requiredTeam,  
        requiredTeamVolume,  
        requiredActiveStake,  
        reward  
    );  
}

}
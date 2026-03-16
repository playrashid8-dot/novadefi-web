"use client";

/* =========================================
🔥 CONTRACT ADDRESSES (BSC MAINNET)
========================================= */

export const NOVADEFI_ADDRESS =
  "0x22A6C258c5a241D8e87a1B1AABC9dE24EDFCE2A1" as const;

export const USDT_ADDRESS =
  "0x55d398326f99059fF775485246999027B3197955" as const;

/* =========================================
📜 NOVADEFI ABI (LATEST DEPLOYED CONTRACT)
========================================= */

export const NOVADEFI_ABI = [
  {
    inputs: [
      { internalType: "address", name: "initialOwner", type: "address" },
      { internalType: "address", name: "token_", type: "address" },
      { internalType: "address", name: "treasury1_", type: "address" },
      { internalType: "address", name: "treasury2_", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },

  /* ===== EVENTS ===== */

  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "planId", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "duration", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "returnBps", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "minStake", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "maxStake", type: "uint256" },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxActivePerUser",
        type: "uint256",
      },
      { indexed: false, internalType: "bool", name: "enabled", type: "bool" },
    ],
    name: "PlanSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "address", name: "referrer", type: "address" },
    ],
    name: "ReferrerBound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "RewardsClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "uint256", name: "stageId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "reward", type: "uint256" },
    ],
    name: "SalaryRewardCredited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "stageId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "requiredDirect", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "requiredTeam", type: "uint256" },
      {
        indexed: false,
        internalType: "uint256",
        name: "requiredTeamVolume",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "requiredActiveStake",
        type: "uint256",
      },
      { indexed: false, internalType: "uint256", name: "reward", type: "uint256" },
    ],
    name: "SalaryStageSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "uint256", name: "stakeIndex", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "capital", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "profit", type: "uint256" },
    ],
    name: "StakeClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: true, internalType: "uint256", name: "stakeIndex", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "planId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "profit", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "startTime", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "endTime", type: "uint256" },
    ],
    name: "StakeCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "fromUser", type: "address" },
      { indexed: true, internalType: "address", name: "leader", type: "address" },
      { indexed: true, internalType: "uint256", name: "level", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "TeamIncomeCredited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "treasury1", type: "address" },
      { indexed: true, internalType: "address", name: "treasury2", type: "address" },
    ],
    name: "TreasuryWalletsUpdated",
    type: "event",
  },

  /* ===== READ FUNCTIONS ===== */

  {
    name: "BPS",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    name: "UNIT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    name: "canClaimSalary",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
  },
  {
    name: "getNextSalaryRequirement",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    outputs: [
      { internalType: "uint256", name: "nextStage", type: "uint256" },
      { internalType: "uint256", name: "requiredDirect", type: "uint256" },
      { internalType: "uint256", name: "requiredTeam", type: "uint256" },
      { internalType: "uint256", name: "requiredTeamVolume", type: "uint256" },
      { internalType: "uint256", name: "requiredActiveStake", type: "uint256" },
      { internalType: "uint256", name: "reward", type: "uint256" },
      { internalType: "uint256", name: "currentFreshDirect", type: "uint256" },
      { internalType: "uint256", name: "currentFreshTeam", type: "uint256" },
      { internalType: "uint256", name: "currentFreshVolume", type: "uint256" },
      { internalType: "bool", name: "claimable", type: "bool" },
    ],
  },
  {
    name: "getRewardBalance",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    name: "getStakeCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    name: "getTeamLevels",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    outputs: [
      { internalType: "uint256", name: "level1", type: "uint256" },
      { internalType: "uint256", name: "level2", type: "uint256" },
      { internalType: "uint256", name: "level3", type: "uint256" },
      { internalType: "uint256", name: "level4", type: "uint256" },
      { internalType: "uint256", name: "level5", type: "uint256" },
    ],
  },
  {
    name: "getUserStakes",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "profit", type: "uint256" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "uint256", name: "planId", type: "uint256" },
          { internalType: "bool", name: "claimed", type: "bool" },
        ],
        internalType: "struct NovaDeFi.StakeInfo[]",
        name: "",
        type: "tuple[]",
      },
    ],
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "address", name: "", type: "address" }],
  },
  {
    name: "planCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    name: "plans",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "uint256", name: "planId", type: "uint256" }],
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "uint256", name: "duration", type: "uint256" },
      { internalType: "uint256", name: "returnBps", type: "uint256" },
      { internalType: "uint256", name: "minStake", type: "uint256" },
      { internalType: "uint256", name: "maxStake", type: "uint256" },
      { internalType: "uint256", name: "maxActivePerUser", type: "uint256" },
      { internalType: "bool", name: "enabled", type: "bool" },
    ],
  },
  {
    name: "previewTeamIncome",
    type: "function",
    stateMutability: "view",
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "expectedProfit", type: "uint256" },
    ],
    outputs: [
      { internalType: "uint256[5]", name: "rewards", type: "uint256[5]" },
      { internalType: "uint256", name: "total", type: "uint256" },
    ],
  },
  {
    name: "salaryStages",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "uint256", name: "stageId", type: "uint256" }],
    outputs: [
      { internalType: "uint256", name: "requiredDirect", type: "uint256" },
      { internalType: "uint256", name: "requiredTeam", type: "uint256" },
      { internalType: "uint256", name: "requiredTeamVolume", type: "uint256" },
      { internalType: "uint256", name: "requiredActiveStake", type: "uint256" },
      { internalType: "uint256", name: "reward", type: "uint256" },
    ],
  },
  {
    name: "stakingToken",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
  },
  {
    name: "tokenDecimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
  },
  {
    name: "treasury1Bps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    name: "treasury2Bps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
  },
  {
    name: "treasuryWallet1",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "address", name: "", type: "address" }],
  },
  {
    name: "treasuryWallet2",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ internalType: "address", name: "", type: "address" }],
  },
  {
    name: "userMeta",
    type: "function",
    stateMutability: "view",
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    outputs: [
      { internalType: "address", name: "referrer", type: "address" },
      { internalType: "bool", name: "firstStakeDone", type: "bool" },
      { internalType: "uint256", name: "activePrincipal", type: "uint256" },
      { internalType: "uint256", name: "totalStakedVolume", type: "uint256" },
      { internalType: "uint256", name: "rewardBalance", type: "uint256" },
      { internalType: "uint256", name: "directCount", type: "uint256" },
      { internalType: "uint256", name: "teamCount", type: "uint256" },
      { internalType: "uint256", name: "teamVolume", type: "uint256" },
      { internalType: "uint256", name: "salaryStageClaimed", type: "uint256" },
    ],
  },

  /* ===== WRITE FUNCTIONS ===== */

  {
    name: "claimRewards",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "claimSalary",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "claimStake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ internalType: "uint256", name: "stakeIndex", type: "uint256" }],
    outputs: [],
  },
  {
    name: "renounceOwnership",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "setTreasuryWallets",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { internalType: "address", name: "treasury1_", type: "address" },
      { internalType: "address", name: "treasury2_", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "stake",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { internalType: "uint256", name: "planId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "referrer", type: "address" },
    ],
    outputs: [],
  },
] as const;

/* =========================================
💵 ERC20 ABI (USDT)
========================================= */

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
] as const;

/* =========================================
🧩 PLAN IDS
========================================= */

export const PLAN_IDS = {
  BASIC: 0,
  SILVER: 1,
  GOLD: 2,
  VIP: 3,
} as const;
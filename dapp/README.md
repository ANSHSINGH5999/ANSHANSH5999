# NexDeFi — Next-Generation DeFi + AI Platform

```
 ███╗   ██╗███████╗██╗  ██╗██████╗ ███████╗███████╗██╗
 ████╗  ██║██╔════╝╚██╗██╔╝██╔══██╗██╔════╝██╔════╝██║
 ██╔██╗ ██║█████╗   ╚███╔╝ ██║  ██║█████╗  █████╗  ██║
 ██║╚██╗██║██╔══╝   ██╔██╗ ██║  ██║██╔══╝  ██╔══╝  ██║
 ██║ ╚████║███████╗██╔╝ ██╗██████╔╝███████╗██║     ██║
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝     ╚═╝
   Web3 DeFi + AI Platform on Ethereum Sepolia
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    NexDeFi Platform                      │
├─────────────────┬───────────────────┬───────────────────┤
│   Smart Contracts│    React Frontend  │   Node.js Backend  │
│   (Solidity)    │   (Vite + Tailwind)│   (Express API)    │
│                 │                   │                   │
│  • NexToken.sol │  • Home Page      │  • /api/ai/chat   │
│    ERC20 token  │  • Dashboard      │  • /api/ai/insights│
│                 │  • Staking Page   │  • /api/blockchain │
│  • NexStaking   │  • AI Chat Page   │  • OpenAI GPT-4o  │
│    12% APY      │                   │    mini           │
│    7-day lock   │  Zustand Store    │                   │
│    Rewards      │  ethers.js v6     │  ethers.js v6     │
│                 │  React Router     │  Rate Limiting    │
├─────────────────┴───────────────────┴───────────────────┤
│                 Ethereum Sepolia Testnet                  │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Ethereum Sepolia Testnet |
| Smart Contracts | Solidity 0.8.20 + OpenZeppelin v5 |
| Contract Framework | Hardhat 2.22 |
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 |
| Web3 | ethers.js v6 |
| State Management | Zustand v4 |
| Animations | Framer Motion v11 |
| Charts | Recharts v2 |
| Backend | Node.js + Express 4 |
| AI | OpenAI GPT-4o-mini |
| Design | Dark neon futuristic theme |

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Git
- (Optional) Infura/Alchemy account for Sepolia RPC
- (Optional) OpenAI API key for AI features

## Project Structure

```
dapp/
├── contracts/              # Hardhat smart contracts
│   ├── contracts/
│   │   ├── NexToken.sol    # ERC20 token (1M initial, 10M max)
│   │   ├── NexStaking.sol  # Staking contract (12% APY)
│   │   └── interfaces/
│   │       └── INexStaking.sol
│   ├── scripts/
│   │   └── deploy.js       # Deployment script
│   ├── test/
│   │   ├── NexToken.test.js
│   │   └── NexStaking.test.js
│   ├── hardhat.config.js
│   └── package.json
│
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/         # AI chat components
│   │   │   ├── dashboard/  # Balance cards, tx history
│   │   │   ├── layout/     # Navbar, Sidebar
│   │   │   ├── staking/    # Staking panel & stats
│   │   │   ├── ui/         # Button, Card, GlowBadge
│   │   │   └── wallet/     # ConnectWallet component
│   │   ├── constants/
│   │   │   ├── config.js   # ABIs + contract addresses
│   │   │   └── deployments.json
│   │   ├── hooks/
│   │   │   ├── useWallet.js
│   │   │   └── useStaking.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Staking.jsx
│   │   │   └── AIChat.jsx
│   │   ├── services/
│   │   │   ├── contractService.js
│   │   │   └── aiService.js
│   │   └── store/
│   │       └── useStore.js  # Zustand global state
│   └── package.json
│
├── backend/                # Node.js Express API
│   ├── src/
│   │   ├── middleware/
│   │   │   └── rateLimiter.js
│   │   ├── routes/
│   │   │   ├── ai.js       # AI chat endpoints
│   │   │   └── blockchain.js
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   └── blockchainService.js
│   │   └── index.js        # Express server
│   └── package.json
│
└── README.md
```

## Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd ANSHSINGH5999-main/dapp
```

### Step 2: Install & Compile Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
```

### Step 3a: Local Development (Hardhat Node)

Start a local Hardhat blockchain:

```bash
# Terminal 1 - Start local node
npx hardhat node
```

Deploy contracts to local node:

```bash
# Terminal 2
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract addresses from the output.

### Step 3b: Deploy to Sepolia Testnet

```bash
# 1. Copy and fill environment variables
cp .env.example .env
# Edit .env with your PRIVATE_KEY, SEPOLIA_RPC_URL, ETHERSCAN_API_KEY

# 2. Deploy
npx hardhat run scripts/deploy.js --network sepolia

# 3. (Optional) Verify on Etherscan
npx hardhat verify --network sepolia <NEX_TOKEN_ADDRESS> "<DEPLOYER_ADDRESS>"
npx hardhat verify --network sepolia <NEX_STAKING_ADDRESS> "<NEX_TOKEN_ADDRESS>" "<DEPLOYER_ADDRESS>"
```

### Step 4: Configure Frontend Environment

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_CHAIN_ID=11155111
VITE_NEX_TOKEN_ADDRESS=0x<from deploy output>
VITE_NEX_STAKING_ADDRESS=0x<from deploy output>
```

### Step 5: Install & Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

### Step 6: Configure & Run Backend

```bash
cd ../backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=3001
OPENAI_API_KEY=sk-your-openai-api-key
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
NEX_TOKEN_ADDRESS=0x<from deploy output>
NEX_STAKING_ADDRESS=0x<from deploy output>
ALLOWED_ORIGINS=http://localhost:5173
```

```bash
npm install
npm run dev
```

Backend runs at: **http://localhost:3001**

### Step 7: Run Tests

```bash
cd contracts
npx hardhat test
```

---

## Smart Contract Documentation

### NexToken.sol

An ERC20 token with governance features.

| Function | Access | Description |
|----------|--------|-------------|
| `mint(address, uint256)` | Owner | Mint new tokens (max 10M total) |
| `burn(uint256)` | Public | Burn caller's tokens |
| `burnFrom(address, uint256)` | Public | Burn with allowance |
| `pause()` | Owner | Pause all transfers |
| `unpause()` | Owner | Resume transfers |

**Events:** `Transfer`, `Approval`, `TokensMinted`

**Constants:**
- `INITIAL_SUPPLY`: 1,000,000 NEX
- `MAX_SUPPLY`: 10,000,000 NEX

### NexStaking.sol

Staking contract with per-second reward accrual.

| Function | Access | Description |
|----------|--------|-------------|
| `stake(uint256)` | Public | Stake NEX tokens (min 100 NEX) |
| `unstake()` | Public | Unstake after 7-day lock period |
| `claimRewards()` | Public | Claim rewards without unstaking |
| `getRewards(address)` | View | Get pending rewards |
| `getStakeInfo(address)` | View | Get full staking info |
| `fundRewardPool(uint256)` | Owner | Add to reward pool |
| `emergencyWithdraw(address)` | Owner | Emergency exit for a user |
| `pause() / unpause()` | Owner | Emergency pause |

**Events:** `Staked`, `Unstaked`, `RewardsClaimed`, `EmergencyWithdrawn`

**Constants:**
- `APY_RATE`: 12 (12% annual)
- `MIN_STAKE`: 100 NEX
- `LOCK_PERIOD`: 7 days

**Reward Formula:**
```
rewards = (stakedAmount × APY_RATE × timeElapsed) / (100 × SECONDS_PER_YEAR)
```

---

## Frontend Features

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with features and stats |
| Dashboard | `/dashboard` | Portfolio overview, balance cards, tx history |
| Staking | `/staking` | Stake/Unstake/Claim UI with APY calculator |
| AI Chat | `/ai-chat` | GPT-4o-mini powered DeFi assistant |

### Key Components

- **ConnectWallet** — MetaMask integration with network switching
- **BalanceCard** — Animated stat cards with sparkline charts
- **StakingPanel** — Full staking interface with lock countdown timer
- **StakingStats** — Circular progress for lock period, real-time refresh
- **AIAssistant** — Full chat UI with markdown rendering and quick prompts
- **TransactionHistory** — Etherscan-linked transaction table

---

## Backend API Reference

### Base URL: `http://localhost:3001`

### Endpoints

#### `GET /api/health`
Returns server health status.

#### `POST /api/ai/chat`
Send a message to NexAI.

```json
{
  "messages": [
    { "role": "user", "content": "How do I stake NEX?" }
  ],
  "context": {
    "nexBalance": "500",
    "stakedAmount": "1000",
    "pendingRewards": "12.5"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "To stake NEX tokens...",
  "model": "gpt-4o-mini"
}
```

#### `POST /api/ai/insights`
Get portfolio analysis.

```json
{
  "portfolioData": {
    "ethBalance": "0.5",
    "nexBalance": "2000",
    "stakedAmount": "1000",
    "pendingRewards": "50"
  }
}
```

#### `GET /api/blockchain/info/:address`
Get token + staking info for an address.

#### `GET /api/blockchain/gas`
Get current Sepolia gas prices.

### Rate Limits
- General: 100 requests / 15 minutes
- AI endpoints: 20 requests / 15 minutes

---

## Production Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
vercel --prod
```

Or connect your GitHub repo to Vercel and set environment variables in the Vercel dashboard.

### Backend (Railway / Render)

1. Push your code to GitHub
2. Connect to Railway or Render
3. Set environment variables:
   - `PORT=3001`
   - `OPENAI_API_KEY=...`
   - `SEPOLIA_RPC_URL=...`
   - `NEX_TOKEN_ADDRESS=...`
   - `NEX_STAKING_ADDRESS=...`
   - `ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app`

---

## Sepolia Testnet Resources

- **Faucet**: https://sepoliafaucet.com
- **Alchemy Faucet**: https://sepoliafaucet.com
- **Chainlink Faucet**: https://faucets.chain.link/sepolia
- **Block Explorer**: https://sepolia.etherscan.io
- **RPC Providers**:
  - Infura: https://infura.io (free tier available)
  - Alchemy: https://alchemy.com (free tier available)
  - Public RPC: https://rpc.sepolia.org

---

## Common Issues & Solutions

### "MetaMask not detected"
Install MetaMask from https://metamask.io and refresh the page.

### "Wrong network" warning
Click the warning badge in the wallet dropdown to automatically switch to Sepolia.

### Transactions failing
1. Check you have enough SepoliaETH for gas
2. Verify contract addresses are correct in `.env`
3. Ensure you're on the correct network (Sepolia chain ID: 11155111)

### AI chat not working
1. Verify `OPENAI_API_KEY` is set in `backend/.env`
2. Check the backend server is running on port 3001
3. Check `ALLOWED_ORIGINS` includes your frontend URL

### Contract deployment fails
1. Check `PRIVATE_KEY` in `contracts/.env` has enough SepoliaETH
2. Verify `SEPOLIA_RPC_URL` is valid
3. Try `npx hardhat clean && npx hardhat compile`

### Rewards showing 0
1. Make sure you have an active stake
2. Rewards accumulate per second — check back after a few minutes
3. Click the refresh button in the Staking Stats panel

---

## Security Best Practices

- Never commit `.env` files — they are in `.gitignore`
- Never share your `PRIVATE_KEY`
- This is a testnet demo — do not use real funds
- Smart contracts include ReentrancyGuard, Pausable, and Ownable safeguards
- Rate limiting is enforced on all API endpoints
- CORS is restricted to configured origins

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Write tests for new contract functionality
4. Ensure `npx hardhat test` passes
5. Submit a pull request with a clear description

---

## License

MIT License — see LICENSE file for details.

---

*Built with Solidity, React, and ❤️ by the NexDeFi team*

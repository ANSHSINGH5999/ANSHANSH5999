import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are NexAI, an intelligent Web3 DeFi assistant for the NexDeFi platform — a staking and analytics platform built on Ethereum Sepolia testnet.

Your role:
- Help users understand DeFi concepts: staking, yield farming, liquidity pools, AMMs, etc.
- Explain NexDeFi platform features: NEX token staking with 12% APY, 7-day lock period, reward claiming
- Guide users through staking NEX tokens step by step
- Analyze portfolio data and provide insights when given user context
- Explain blockchain concepts: transactions, gas fees, wallets, smart contracts
- Discuss risk management and safe DeFi practices

NexDeFi Platform Details:
- Token: NEX (ERC20 on Sepolia testnet)
- Staking APY: 12% annually, calculated per second
- Minimum stake: 100 NEX tokens
- Lock period: 7 days (tokens locked, rewards accumulate)
- Rewards can be claimed at any time without unstaking
- Smart contracts are Pausable and use ReentrancyGuard for security
- Maximum supply: 10,000,000 NEX

Important rules:
- Be concise, accurate, and educational
- Do NOT give specific financial advice or price predictions
- Always mention this is a testnet demo platform
- If asked about real money, clarify this uses test tokens only
- Format responses with markdown for clarity (use headers, bullets, code blocks when helpful)
- Keep responses focused and under 400 words unless detail is necessary`;

/**
 * Send a chat message to GPT-4o-mini
 * @param {Array} messages - Array of {role, content} objects
 * @param {Object|null} context - User context (wallet, balances, etc.)
 * @returns {Promise<{message: string, model: string, usage: object}>}
 */
export async function chat(messages, context = null) {
  // Build system message with optional context
  let systemContent = SYSTEM_PROMPT;

  if (context) {
    systemContent += `\n\n---\nCurrent User Context:\n`;
    if (context.userAddress && context.userAddress !== 'Not connected') {
      systemContent += `- Wallet Address: ${context.userAddress}\n`;
    }
    if (context.nexBalance) systemContent += `- NEX Balance: ${context.nexBalance} NEX\n`;
    if (context.stakedAmount) systemContent += `- Currently Staked: ${context.stakedAmount} NEX\n`;
    if (context.pendingRewards) systemContent += `- Pending Rewards: ${context.pendingRewards} NEX\n`;
    if (context.platform) systemContent += `- Platform: ${context.platform}\n`;
    systemContent += `- Note: Always reference this context when giving personalized advice.\n---`;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemContent },
      ...messages.slice(-20), // Keep last 20 messages for context window management
    ],
    max_tokens: 600,
    temperature: 0.7,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
  });

  const response = completion.choices[0];
  if (!response || !response.message) {
    throw new Error('Invalid response from OpenAI API');
  }

  return {
    message: response.message.content,
    model: completion.model,
    usage: completion.usage,
    finishReason: response.finish_reason,
  };
}

/**
 * Analyze a user's portfolio and return insights
 * @param {Object} portfolioData - User portfolio data
 * @returns {Promise<{insights: string, recommendations: Array}>}
 */
export async function getInsights(portfolioData) {
  const prompt = `Analyze this NexDeFi user's portfolio and provide specific, actionable insights:

Portfolio Data:
- ETH Balance: ${portfolioData.ethBalance || '0'} ETH
- NEX Token Balance: ${portfolioData.nexBalance || '0'} NEX
- Currently Staked: ${portfolioData.stakedAmount || '0'} NEX
- Pending Rewards: ${portfolioData.pendingRewards || '0'} NEX
- Can Unstake: ${portfolioData.canUnstake ? 'Yes' : 'No'}
- Lock Period Remaining: ${portfolioData.lockTimeLeft || 'N/A'}
- Network: ${portfolioData.network || 'Sepolia'}

Please provide:
1. A brief portfolio health assessment
2. 2-3 specific recommendations based on their current position
3. Risk considerations for their staking position

Keep it concise and actionable. Use markdown formatting.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    max_tokens: 500,
    temperature: 0.6,
  });

  const content = completion.choices[0]?.message?.content || 'Unable to generate insights.';

  // Parse recommendations (simple extraction)
  const recommendations = [];
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.match(/^[\d\-\*]/) && line.length > 20) {
      recommendations.push(line.replace(/^[\d\.\-\*\s]+/, '').trim());
    }
  }

  return {
    insights: content,
    recommendations: recommendations.slice(0, 5),
    model: completion.model,
  };
}

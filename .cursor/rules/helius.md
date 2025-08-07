# Enhanced Transactions API

> Transform complex Solana blockchain transactions into human-readable data with Helius Enhanced Transactions API. Parse transaction details, fetch history, and understand on-chain activity without manual decoding.

<CardGroup cols={2}>
  <Card title="Parse Transaction(s)" icon="code" href="#parse-individual-transactions">
    Parse individual or multiple transactions to get human-readable data
  </Card>

  <Card title="Transaction History" icon="clock-rotate-left" href="#fetch-transaction-history-for-an-address">
    Get historical transaction data for any address
  </Card>
</CardGroup>

<Note>
  **Quick Reference**:

- `/v0/transactions` - Parse individual or multiple transaction signatures
- `/v0/addresses/{address}/transactions` - Get transaction history for an address
- Filter by transaction type using the `type` parameter (e.g., `NFT_SALE`, `SWAP`, `TRANSFER`)
  </Note>

<Warning>
  **Important Limitations**:

- Enhanced Transaction API V1 won't be updated while we are working on V2
- We only parse NFT, Jupiter, and SPL-related transactions
- **Do not rely on these parsers for DeFi or non-NFT, Jupiter, and SPL transactions**
  </Warning>

## Overview

The Enhanced Transactions API transforms complex Solana transactions into human-readable data. Instead of dealing with raw instruction data and account lists, you get structured information about:

- What happened in the transaction (transfers, swaps, NFT activities)
- Which accounts were involved
- How much SOL or tokens were transferred
- Timestamps and other metadata

## Getting Started

### Parse Individual Transactions

Parse one or more transaction signatures or raw transaction data with a single API call:

<Tabs>
  <Tab title="JavaScript">
    ```javascript
    const parseTransaction = async () => {
      const url = "https://api.helius.xyz/v0/transactions/?api-key=YOUR_API_KEY";

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: ["5rfFLBUp5YPr6rC2g1KBBW8LGZBcZ8Lvs7gKAdgrBjmQvFf6EKkgc5cpAQUTwGxDJbNqtLYkjV5vS5zVK4tb6JtP"],
        }),
      });

      const data = await response.json();
      console.log("Parsed transaction:", data);
    };

    parseTransaction();
    ```

  </Tab>

  <Tab title="Python">
    ```python
    import requests
    import json

    def parse_transaction():
        url = "https://api.helius.xyz/v0/transactions/?api-key=YOUR_API_KEY"

        payload = {
            "transactions": ["5rfFLBUp5YPr6rC2g1KBBW8LGZBcZ8Lvs7gKAdgrBjmQvFf6EKkgc5cpAQUTwGxDJbNqtLYkjV5vS5zVK4tb6JtP"]
        }

        response = requests.post(url, json=payload)
        data = response.json()
        print("Parsed transaction:", data)

    parse_transaction()
    ```

  </Tab>
</Tabs>

<Card title="API Reference" horizontal icon="code" href="/api-reference/enhanced-transactions/gettransactions">
  View detailed documentation for parsing transactions
</Card>

### Fetch Transaction History for an Address

Retrieve transaction history for any Solana address:

<Tabs>
  <Tab title="JavaScript">
    ```javascript
    const fetchWalletTransactions = async () => {
      const walletAddress = "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K"; // Replace with target wallet
      const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=YOUR_API_KEY`;
      
      const response = await fetch(url);
      const transactions = await response.json();
      console.log("Wallet transactions:", transactions);
    };

    fetchWalletTransactions();
    ```

  </Tab>

  <Tab title="Python">
    ```python
    import requests

    def fetch_wallet_transactions():
        wallet_address = "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K"  # Replace with target wallet
        url = f"https://api.helius.xyz/v0/addresses/{wallet_address}/transactions?api-key=YOUR_API_KEY"

        response = requests.get(url)
        transactions = response.json()
        print("Wallet transactions:", transactions)

    fetch_wallet_transactions()
    ```

  </Tab>
</Tabs>

<Card title="API Reference" horizontal icon="code" href="/api-reference/enhanced-transactions/gettransactionsbyaddress">
  View detailed documentation for transaction history
</Card>

<Warning>
  **Handling Incomplete Transaction Sets**

Occasionally, history endpoint may return an incomplete set of transactions due to internal timeouts during data retrieval.

To mitigate this issue:

1. First, call `getSignaturesForAddress` to retrieve a batch of transaction signatures
2. Next, use the `/v0/transactions` endpoint with the received signatures
3. If any transactions are missing from the response, you can retry fetching these specific transactions
   </Warning>

## Common Use Cases

### Complete Pagination Example

For high-volume addresses, implement pagination to fetch all transactions:

```javascript
const fetchAllTransactions = async () => {
  const walletAddress = "2k5AXX4guW9XwRQ1AKCpAuUqgWDpQpwFfpVFh3hnm2Ha"; // Replace with target wallet
  const baseUrl = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=YOUR_API_KEY`;
  let url = baseUrl;
  let lastSignature = null;
  let allTransactions = [];

  while (true) {
    if (lastSignature) {
      url = baseUrl + `&before=${lastSignature}`;
    }

    const response = await fetch(url);

    // Check response status
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      break;
    }

    const transactions = await response.json();

    if (transactions && transactions.length > 0) {
      console.log(`Fetched batch of ${transactions.length} transactions`);
      allTransactions = [...allTransactions, ...transactions];
      lastSignature = transactions[transactions.length - 1].signature;
    } else {
      console.log(`Finished! Total transactions: ${allTransactions.length}`);
      break;
    }
  }

  return allTransactions;
};
```

### Filter Transactions by Type

Get only specific transaction types, such as NFT sales:

<Tabs>
  <Tab title="NFT Sales">
    ```javascript
    const fetchNftSales = async () => {
      const tokenAddress = "GjUG1BATg5V4bdAr1csKys1XK9fmrbntgb1iV7rAkn94"; // NFT mint address
      const url = `https://api.helius.xyz/v0/addresses/${tokenAddress}/transactions?api-key=YOUR_API_KEY&type=NFT_SALE`;
      
      const response = await fetch(url);
      const nftSales = await response.json();
      console.log("NFT sale transactions:", nftSales);
    };
    ```
  </Tab>

  <Tab title="Token Transfers">
    ```javascript
    const fetchTokenTransfers = async () => {
      const walletAddress = "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K"; // Wallet address
      const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=YOUR_API_KEY&type=TRANSFER`;
      
      const response = await fetch(url);
      const transfers = await response.json();
      console.log("Transfer transactions:", transfers);
    };
    ```
  </Tab>

  <Tab title="Swaps">
    ```javascript
    const fetchSwapTransactions = async () => {
      const walletAddress = "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K"; // Wallet address
      const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=YOUR_API_KEY&type=SWAP`;
      
      const response = await fetch(url);
      const swaps = await response.json();
      console.log("Swap transactions:", swaps);
    };
    ```
  </Tab>
</Tabs>

## API Reference

### Query Parameters

| Parameter    | Description                              | Default     | Example                 |
| ------------ | ---------------------------------------- | ----------- | ----------------------- |
| `limit`      | Number of transactions to return         | 10          | `&limit=25`             |
| `before`     | Fetch transactions before this signature | -           | `&before=sig123...`     |
| `until`      | Fetch transactions until this signature  | -           | `&until=sig456...`      |
| `type`       | Filter by transaction type               | -           | `&type=NFT_SALE`        |
| `commitment` | Commitment level                         | `finalized` | `&commitment=confirmed` |

### Response Example

Enhanced transaction responses include structured data with human-readable descriptions:

```json
{
  "description": "Transfer 0.1 SOL to FXvStt8aeQHMGKDgqaQ2HXWfJsXnqiKSoBEpHJahkuD",
  "type": "TRANSFER",
  "source": "SYSTEM_PROGRAM",
  "fee": 5000,
  "feePayer": "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K",
  "signature": "5rfFLBUp5YPr6rC2g1KBBW8LGZBcZ8Lvs7gKAdgrBjmQvFf6EKkgc5cpAQUTwGxDJbNqtLYkjV5vS5zVK4tb6JtP",
  "slot": 171341028,
  "timestamp": 1674080473,
  "nativeTransfers": [
    {
      "fromUserAccount": "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K",
      "toUserAccount": "FXvStt8aeQHMGKDgqaQ2HXWfJsXnqiKSoBEpHJahkuD",
      "amount": 100000000
    }
  ],
  "events": {
    "sol": {
      "from": "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K",
      "to": "FXvStt8aeQHMGKDgqaQ2HXWfJsXnqiKSoBEpHJahkuD",
      "amount": 0.1
    }
  }
}
```

## Best Practices

<CardGroup cols={2}>
  <Card title="Error Handling" icon="shield-check">
    Implement proper error handling and retries for production applications
  </Card>

  <Card title="Rate Limiting" icon="gauge-high">
    Use pagination and caching strategies to avoid hitting rate limits
  </Card>
</CardGroup>

### Error Handling

Always implement proper error handling in your code:

```javascript
const fetchTransactions = async () => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    // Implement retry logic or user-friendly error messages
  }
};
```

### Rate Limiting Considerations

To avoid hitting rate limits when working with the API:

- Implement pagination for large datasets
- Cache responses when appropriate
- Add exponential backoff for retries
- Consider upgrading your API plan for high-volume applications

<Tip>
  For high-traffic applications, consider implementing a caching layer with Redis or similar technology to minimize redundant API calls.
</Tip>

## FAQs

<AccordionGroup>
  <Accordion title="What is the Enhanced Transactions API?">
    The Enhanced Transactions API provides parsed transaction data in a human-readable format. It allows you to parse individual or multiple transactions or fetch the complete historical transaction history for a specific address.
  </Accordion>

  <Accordion title="What types of transactions can be parsed?">
    Currently, the Enhanced Transactions API only parses NFT, Jupiter, and SPL-related transactions. Do not rely on these parsers for DeFi or non-NFT, Jupiter, and SPL transactions.
  </Accordion>

  <Accordion title="What's the difference between V1 and V2?">
    Enhanced Transaction API V1 won't be updated while we are working on V2. V2 will introduce additional parsing capabilities and improvements.
  </Accordion>

  <Accordion title="How do I authenticate API requests?">
    All requests to the Enhanced Transactions API require your Helius API key, which should be provided as a query parameter (`?api-key=YOUR_API_KEY`).
  </Accordion>

  <Accordion title="Are there rate limits?">
    Yes, API usage is subject to Helius's standard rate limiting and pricing policies. Please refer to the [Plans & Rate limits](/billing/plans-and-rate-limits) page for more information.
  </Accordion>
</AccordionGroup>

# Quickstart

> Get started with Helius data streaming in minutes.

## Overview

This guide will help you get started with Helius data streaming using standard WebSockets. It includes basic examples for the most common use cases.

## Prerequisites

- A Helius API key (sign up on the [Helius dashboard](https://dashboard.helius.dev) if you don't have one)
- Basic knowledge of JavaScript and WebSockets

## Setting Up a WebSocket Connection

First, let's set up a basic WebSocket connection to Helius:

```javascript
// Initialize WebSocket connection
const ws = new WebSocket("wss://mainnet.helius-rpc.com?api-key=YOUR_API_KEY");

// Handle connection opened
ws.onopen = () => {
  console.log("WebSocket connection established");
  // You can send subscription requests once the connection is established
};

// Handle received messages
ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log("Received data:", response);
};

// Handle errors
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

// Handle connection close
ws.onclose = () => {
  console.log("WebSocket connection closed");
};
```

Replace `YOUR_API_KEY` with your actual Helius API key.

## Subscribing to Account Updates

To receive updates whenever an account changes:

```javascript
// Subscribe to account updates
const subscribeToAccount = (accountPublicKey) => {
  const subscriptionRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "accountSubscribe",
    params: [
      accountPublicKey,
      {
        encoding: "jsonParsed",
        commitment: "confirmed",
      },
    ],
  };

  ws.send(JSON.stringify(subscriptionRequest));
};

// Example: Subscribe to a token account
subscribeToAccount("9PejEmViKHgUkVFWN57cNEZnFS4Qo6SzsLj5UPAXfDTF");
```

## Subscribing to Program Updates

To receive notifications when any account owned by a program changes:

```javascript
// Subscribe to program updates
const subscribeToProgram = (programId) => {
  const subscriptionRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "programSubscribe",
    params: [
      programId,
      {
        encoding: "jsonParsed",
        commitment: "confirmed",
      },
    ],
  };

  ws.send(JSON.stringify(subscriptionRequest));
};

// Example: Subscribe to the Token Program
subscribeToProgram("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
```

## Subscribing to Transaction Signatures

To track the status of a specific transaction:

```javascript
// Subscribe to signature updates
const subscribeToSignature = (signature) => {
  const subscriptionRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "signatureSubscribe",
    params: [
      signature,
      {
        commitment: "confirmed",
      },
    ],
  };

  ws.send(JSON.stringify(subscriptionRequest));
};

// Example: Subscribe to a transaction signature
subscribeToSignature(
  "5UfDuA1mQcZeb7BZyWU5T6CvZsYqsRwBUHFyMeTzwcnn8S6W9vzVDjp3NgjV7qHJQvw5qQbbGvGxoULZKHGUdSmo",
);
```

## Subscribing to Log Messages

To receive log messages that match specific filters:

```javascript
// Subscribe to log messages
const subscribeToLogs = (filter) => {
  const subscriptionRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "logsSubscribe",
    params: [
      filter,
      {
        commitment: "confirmed",
      },
    ],
  };

  ws.send(JSON.stringify(subscriptionRequest));
};

// Example 1: Subscribe to all logs
subscribeToLogs("all");

// Example 2: Subscribe to logs from a specific program
subscribeToLogs({
  mentions: ["11111111111111111111111111111111"], // System Program
});
```

## Unsubscribing

To stop receiving updates for a subscription:

```javascript
// Unsubscribe from a subscription
const unsubscribe = (subscriptionId) => {
  const unsubscribeRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "unsubscribe",
    params: [subscriptionId],
  };

  ws.send(JSON.stringify(unsubscribeRequest));
};

// Example: Unsubscribe using the ID returned from a subscription response
unsubscribe(12345); // Replace with your actual subscription ID
```

## Next Steps

This quickstart covers the basics of using Helius data streaming with standard WebSockets. For more advanced streaming capabilities, consider:

- [LaserStream](/laserstream) - Our premium streaming solution with historical replay and multiple protocol options
- [Enhanced WebSockets](/laserstream/websocket) - Faster WebSockets with additional subscription methods
- [gRPC Streaming](/laserstream) - High-performance binary protocol for backend applications

For a complete reference of all WebSocket methods, see the [WebSocket documentation](/rpc/websocket).

# Webhooks

> Setup powerful event-driven workflows in seconds.

Helius Webhooks enable seamless monitoring of Solana on-chain events, such as sales, listings, swaps, and more. We offer a user-friendly interface, programmatic API, and SDK access for easily creating and managing webhooks.

For a detailed list of supported events, please refer to our [documentation](/webhooks/faqs).

<Warning>
  Webhook events are charged at 1 credit. Editing, adding, or deleting a webhook via the API will cost 100 credits/request.
</Warning>

## Types of Webhooks

We currently offer several types of webhooks tailored to different needs:

- **Enhanced Transaction Webhooks**: Provide human-readable, parsed data for specific transaction types (e.g., NFT sales) related to the addresses you monitor. This is ideal if you want filtered, actionable insights.
- **Raw Transaction Webhooks**: This option delivers raw transaction data for all transactions involving the addresses you monitor. It does not allow filtering by transaction type.
- **Discord Webhooks**: Stream updates for specific transaction types directly to a designated Discord channel as formatted messages. To use this option, you must submit your Discord Webhook URL.

<Info>
  Raw Transaction Webhooks offer lower latency since they do not involve parsing event types.
</Info>

### Event Payload Example

<Accordion title="Enhanced">
  ```json
  [
    {
      "accountData": [
        {
          "account": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
          "nativeBalanceChange": -72938049280,
          "tokenBalanceChanges": []
        },
        {
          "account": "NTYeYJ1wr4bpM5xo6zx5En44SvJFAd35zTxxNoERYqd",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "AAaTGaA3uVqikfVEwoSG7EwkCb4bBDsMEyueiVUS5CaU",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "autMW8SgBkVYeBgqYiTuJZnkvDZMVU2MHJh9Jh7CSQ2",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "D8TxfGwdu9MiNMoJmUoC9wQfNfNT7Lnm6DzifQHRTy6B",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "5DxD5ViWjvRZEkxQEaJHZw2sBsso6xoXx3wGFNKgXUzE",
          "nativeBalanceChange": 71860273440,
          "tokenBalanceChanges": []
        },
        {
          "account": "25DTUAd1roBFoUQaxJQByL6Qy2cKQCBp4bK9sgfy9UiM",
          "nativeBalanceChange": -2039280,
          "tokenBalanceChanges": [
            {
              "mint": "FdsNQE5EeCe57tbEYCRV1JwW5dzNCof7MUTaGWhmzYqu",
              "rawTokenAmount": {
                "decimals": 0,
                "tokenAmount": "-1"
              },
              "tokenAccount": "25DTUAd1roBFoUQaxJQByL6Qy2cKQCBp4bK9sgfy9UiM",
              "userAccount": "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix"
            }
          ]
        },
        {
          "account": "DTYuh7gAGGZg2okM7hdFfU1yMY9LUemCiPyD5Z5GCs6Z",
          "nativeBalanceChange": 2039280,
          "tokenBalanceChanges": [
            {
              "mint": "FdsNQE5EeCe57tbEYCRV1JwW5dzNCof7MUTaGWhmzYqu",
              "rawTokenAmount": {
                "decimals": 0,
                "tokenAmount": "1"
              },
              "tokenAccount": "DTYuh7gAGGZg2okM7hdFfU1yMY9LUemCiPyD5Z5GCs6Z",
              "userAccount": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX"
            }
          ]
        },
        {
          "account": "rFqFJ9g7TGBD8Ed7TPDnvGKZ5pWLPDyxLcvcH2eRCtt",
          "nativeBalanceChange": 1080000000,
          "tokenBalanceChanges": []
        },
        {
          "account": "CgXS5xC3qAGSg9txD9bS7BUgugZwshivGXpCJcGmdwrd",
          "nativeBalanceChange": -2234160,
          "tokenBalanceChanges": []
        },
        {
          "account": "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "E8cU1WiRWjanGxmn96ewBgk9vPTcL6AEZ1t6F6fkgUWe",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "11111111111111111111111111111111",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "FdsNQE5EeCe57tbEYCRV1JwW5dzNCof7MUTaGWhmzYqu",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "AYZsWahcrSnkwqbA1ji7wEzgAnGjLNJhVUMDPfACECZf",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "SysvarRent111111111111111111111111111111111",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        },
        {
          "account": "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix",
          "nativeBalanceChange": 0,
          "tokenBalanceChanges": []
        }
      ],
      "description": "5DxD5ViWjvRZEkxQEaJHZw2sBsso6xoXx3wGFNKgXUzE sold Fox #7637 to CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX for 72 SOL on MAGIC_EDEN.",
      "events": {
        "nft": {
          "amount": 72000000000,
          "buyer": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
          "description": "5DxD5ViWjvRZEkxQEaJHZw2sBsso6xoXx3wGFNKgXUzE sold Fox #7637 to CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX for 72 SOL on MAGIC_EDEN.",
          "fee": 10000,
          "feePayer": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
          "nfts": [
            {
              "mint": "FdsNQE5EeCe57tbEYCRV1JwW5dzNCof7MUTaGWhmzYqu",
              "tokenStandard": "NonFungible"
            }
          ],
          "saleType": "INSTANT_SALE",
          "seller": "5DxD5ViWjvRZEkxQEaJHZw2sBsso6xoXx3wGFNKgXUzE",
          "signature": "5nNtjezQMYBHvgSQmoRmJPiXGsPAWmJPoGSa64xanqrauogiVzFyGQhKeFataHGXq51jR2hjbzNTkPUpP787HAmL",
          "slot": 171942732,
          "source": "MAGIC_EDEN",
          "staker": "",
          "timestamp": 1673445241,
          "type": "NFT_SALE"
        }
      },
      "fee": 10000,
      "feePayer": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
      "nativeTransfers": [
        {
          "amount": 72936000000,
          "fromUserAccount": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
          "toUserAccount": "AAaTGaA3uVqikfVEwoSG7EwkCb4bBDsMEyueiVUS5CaU"
        },
        {
          "amount": 2011440,
          "fromUserAccount": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
          "toUserAccount": "D8TxfGwdu9MiNMoJmUoC9wQfNfNT7Lnm6DzifQHRTy6B"
        },
        {
          "amount": 71856000000,
          "fromUserAccount": "AAaTGaA3uVqikfVEwoSG7EwkCb4bBDsMEyueiVUS5CaU",
          "toUserAccount": "5DxD5ViWjvRZEkxQEaJHZw2sBsso6xoXx3wGFNKgXUzE"
        },
        {
          "amount": 1080000000,
          "fromUserAccount": "AAaTGaA3uVqikfVEwoSG7EwkCb4bBDsMEyueiVUS5CaU",
          "toUserAccount": "rFqFJ9g7TGBD8Ed7TPDnvGKZ5pWLPDyxLcvcH2eRCtt"
        },
        {
          "amount": 2039280,
          "fromUserAccount": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
          "toUserAccount": "DTYuh7gAGGZg2okM7hdFfU1yMY9LUemCiPyD5Z5GCs6Z"
        }
      ],
      "signature": "5nNtjezQMYBHvgSQmoRmJPiXGsPAWmJPoGSa64xanqrauogiVzFyGQhKeFataHGXq51jR2hjbzNTkPUpP787HAmL",
      "slot": 171942732,
      "source": "MAGIC_EDEN",
      "timestamp": 1673445241,
      "tokenTransfers": [
        {
          "fromTokenAccount": "25DTUAd1roBFoUQaxJQByL6Qy2cKQCBp4bK9sgfy9UiM",
          "fromUserAccount": "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix",
          "mint": "FdsNQE5EeCe57tbEYCRV1JwW5dzNCof7MUTaGWhmzYqu",
          "toTokenAccount": "DTYuh7gAGGZg2okM7hdFfU1yMY9LUemCiPyD5Z5GCs6Z",
          "toUserAccount": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
          "tokenAmount": 1,
          "tokenStandard": "NonFungible"
        }
      ],
      "type": "NFT_SALE"
    }
  ]
  ```
</Accordion>

<Accordion title="Raw">
  ```javascript
  [
    {
      "blockTime": 1673445241,
      "indexWithinBlock": 2557,
      "meta": {
        "err": null,
        "fee": 10000,
        "innerInstructions": [
          {
            "index": 0,
            "instructions": [
              {
                "accounts": [
                  0,
                  2
                ],
                "data": "3Bxs3zs3x6pg4XWo",
                "programIdIndex": 12
              }
            ]
          },
          {
            "index": 1,
            "instructions": [
              {
                "accounts": [
                  0,
                  4
                ],
                "data": "11112nba6qLH4BKL4MW8GP9ayKApZeYn3LQKJdPdeSXbRW1n6UPeJ8y77ps6sAVwAjdxzh",
                "programIdIndex": 12
              }
            ]
          },
          {
            "index": 2,
            "instructions": [
              {
                "accounts": [
                  2,
                  5
                ],
                "data": "3Bxs3zx147oWJQej",
                "programIdIndex": 12
              },
              {
                "accounts": [
                  2,
                  8
                ],
                "data": "3Bxs3zwT1TGLhiT9",
                "programIdIndex": 12
              },
              {
                "accounts": [
                  0,
                  7,
                  0,
                  13,
                  12,
                  15
                ],
                "data": "1",
                "programIdIndex": 17
              },
              {
                "accounts": [
                  13
                ],
                "data": "84eT",
                "programIdIndex": 15
              },
              {
                "accounts": [
                  0,
                  7
                ],
                "data": "11119os1e9qSs2u7TsThXqkBSRVFxhmYaFKFZ1waB2X7armDmvK3p5GmLdUxYdg3h7QSrL",
                "programIdIndex": 12
              },
              {
                "accounts": [
                  7
                ],
                "data": "P",
                "programIdIndex": 15
              },
              {
                "accounts": [
                  7,
                  13
                ],
                "data": "6YTZgAHgNKVRJ2mAHQUYC1DgXF6dPCgbSWA5P4gZoSfGV",
                "programIdIndex": 15
              },
              {
                "accounts": [
                  6,
                  7,
                  18
                ],
                "data": "3DdGGhkhJbjm",
                "programIdIndex": 15
              },
              {
                "accounts": [
                  6,
                  5,
                  18
                ],
                "data": "A",
                "programIdIndex": 15
              }
            ]
          }
        ],
        "loadedAddresses": {
          "readonly": [],
          "writable": []
        },
        "logMessages": [
          "Program M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K invoke [1]",
          "Program log: Instruction: Deposit",
          "Program 11111111111111111111111111111111 invoke [2]",
          "Program 11111111111111111111111111111111 success",
          "Program M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K consumed 10148 of 600000 compute units",
          "Program M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K success",
          "Program M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K invoke [1]",
          "Program log: Instruction: Buy",
          "Program 11111111111111111111111111111111 invoke [2]",
          "Program 11111111111111111111111111111111 success",
          "Program log: {\"price\":72000000000,\"buyer_expiry\":0}",
          "Program M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K consumed 30501 of 589852 compute units",
          "Program M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K success",
          "Program M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K invoke [1]",
          "Program log: Instruction: ExecuteSaleV2",
          "Program 11111111111111111111111111111111 invoke [2]",
          "Program 11111111111111111111111111111111 success",
          "Program 11111111111111111111111111111111 invoke [2]",
          "Program 11111111111111111111111111111111 success",
          "Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL invoke [2]",
          "Program log: Create",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
          "Program log: Instruction: GetAccountDataSize",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 1622 of 497733 compute units",
          "Program return: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA pQAAAAAAAAA=",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
          "Program 11111111111111111111111111111111 invoke [3]",
          "Program 11111111111111111111111111111111 success",
          "Program log: Initialize the associated token account",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
          "Program log: Instruction: InitializeImmutableOwner",
          "Program log: Please upgrade to SPL Token 2022 for immutable owner support",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 1405 of 491243 compute units",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [3]",
          "Program log: Instruction: InitializeAccount3",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4241 of 487361 compute units",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
          "Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL consumed 21793 of 504630 compute units",
          "Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL success",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
          "Program log: Instruction: Transfer",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4645 of 475696 compute units",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]",
          "Program log: Instruction: CloseAccount",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 3033 of 456654 compute units",
          "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA success",
          "Program log: {\"price\":72000000000,\"seller_expiry\":-1,\"buyer_expiry\":0}",
          "Program M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K consumed 109266 of 559351 compute units",
          "Program M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K success"
        ],
        "postBalances": [
          371980779080,
          0,
          0,
          100129388687,
          0,
          81872924494,
          0,
          2039280,
          993583055919,
          0,
          1141440,
          3654000,
          1,
          1461600,
          5616720,
          934087680,
          1009200,
          731913600,
          457953014766
        ],
        "postTokenBalances": [
          {
            "accountIndex": 7,
            "mint": "FdsNQE5EeCe57tbEYCRV1JwW5dzNCof7MUTaGWhmzYqu",
            "owner": "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            "uiTokenAmount": {
              "amount": "1",
              "decimals": 0,
              "uiAmount": 1,
              "uiAmountString": "1"
            }
          }
        ],
        "preBalances": [
          444918828360,
          0,
          0,
          100129388687,
          0,
          10012651054,
          2039280,
          0,
          992503055919,
          2234160,
          1141440,
          3654000,
          1,
          1461600,
          5616720,
          934087680,
          1009200,
          731913600,
          457953014766
        ],
        "preTokenBalances": [
          {
            "accountIndex": 6,
            "mint": "FdsNQE5EeCe57tbEYCRV1JwW5dzNCof7MUTaGWhmzYqu",
            "owner": "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix",
            "programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            "uiTokenAmount": {
              "amount": "1",
              "decimals": 0,
              "uiAmount": 1,
              "uiAmountString": "1"
            }
          }
        ],
        "rewards": []
      },
      "slot": 171942732,
      "transaction": {
        "message": {
          "accountKeys": [
            "CKs1E69a2e9TmH4mKKLrXFF8kD3ZnwKjoEuXa6sz9WqX",
            "NTYeYJ1wr4bpM5xo6zx5En44SvJFAd35zTxxNoERYqd",
            "AAaTGaA3uVqikfVEwoSG7EwkCb4bBDsMEyueiVUS5CaU",
            "autMW8SgBkVYeBgqYiTuJZnkvDZMVU2MHJh9Jh7CSQ2",
            "D8TxfGwdu9MiNMoJmUoC9wQfNfNT7Lnm6DzifQHRTy6B",
            "5DxD5ViWjvRZEkxQEaJHZw2sBsso6xoXx3wGFNKgXUzE",
            "25DTUAd1roBFoUQaxJQByL6Qy2cKQCBp4bK9sgfy9UiM",
            "DTYuh7gAGGZg2okM7hdFfU1yMY9LUemCiPyD5Z5GCs6Z",
            "rFqFJ9g7TGBD8Ed7TPDnvGKZ5pWLPDyxLcvcH2eRCtt",
            "CgXS5xC3qAGSg9txD9bS7BUgugZwshivGXpCJcGmdwrd",
            "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K",
            "E8cU1WiRWjanGxmn96ewBgk9vPTcL6AEZ1t6F6fkgUWe",
            "11111111111111111111111111111111",
            "FdsNQE5EeCe57tbEYCRV1JwW5dzNCof7MUTaGWhmzYqu",
            "AYZsWahcrSnkwqbA1ji7wEzgAnGjLNJhVUMDPfACECZf",
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            "SysvarRent111111111111111111111111111111111",
            "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
            "1BWutmTvYPwDtmw9abTkS4Ssr8no61spGAvW1X6NDix"
          ],
          "addressTableLookups": null,
          "header": {
            "numReadonlySignedAccounts": 1,
            "numReadonlyUnsignedAccounts": 9,
            "numRequiredSignatures": 2
          },
          "instructions": [
            {
              "accounts": [
                0,
                1,
                2,
                3,
                11,
                12
              ],
              "data": "3GyWrkssW12wSfxjTynBnbif",
              "programIdIndex": 10
            },
            {
              "accounts": [
                0,
                1,
                13,
                14,
                2,
                3,
                11,
                4,
                3,
                15,
                12,
                16
              ],
              "data": "3Jmjmsq2jyrch5iz612vBLZCRB498owPe7qezQVetRZhiMu",
              "programIdIndex": 10
            },
            {
              "accounts": [
                0,
                5,
                1,
                6,
                13,
                14,
                2,
                7,
                3,
                11,
                8,
                4,
                3,
                9,
                3,
                15,
                12,
                17,
                18,
                16
              ],
              "data": "B2rqPwAgvj3t35y6HpdumfhdhsZMLNFLmXMC9Uz2HX4nNAwirTk3o98vTazFB1y",
              "programIdIndex": 10
            }
          ],
          "recentBlockhash": "3NRncb7FJuDruQjMDxnHvJBQkvkHa7KSUBqBsxG21roZ"
        },
        "signatures": [
          "5nNtjezQMYBHvgSQmoRmJPiXGsPAWmJPoGSa64xanqrauogiVzFyGQhKeFataHGXq51jR2hjbzNTkPUpP787HAmL",
          "4dWBkbLHGvU2jw9Sjj6YETtKfaVKAAN1M8aWzXRNC4aHBckUzM73n3FddNbWTtfUvkU2vFRQ7bKHMwKZQ5dGy1iH"
        ]
      }
    }
  ]
  ```
</Accordion>

## Quick Start

We provide three convenient methods to create, edit, and manage webhooks on Helius.

### Via Helius Dashboard

The Helius UI is perfect if you prefer a no-code solution with additional features like viewing logs and sending test webhook events. You can access it directly through our [Dashboard](https://dashboard.helius.dev/webhooks). You can add up to 25 addresses via the Dashboard. To monitor more than 25 addresses, you can use our API or SDK.

<Accordion title="Via Dashboard">
  You can create a webhook directly from the dashboard:

1. Navigate to the [Helius Dashboard](https://dashboard.helius.dev/webhooks)
2. Click "Add Webhook"
3. Complete the required fields
4. Click "Create Webhook"
   </Accordion>

### Via Helius API

If you're not working with Typescript or Javascript, you'll need to interact with our webhooks through REST API:

<Card title="API Reference" icon="code" href="/api-reference/webhooks">
  Learn about the Webhooks API endpoints and how to use them.
</Card>

### Via Helius SDK

The easiest—and most enjoyable—way to interact with Helius webhooks is through our official SDKs. We currently offer SDKs for **TypeScript** and **Rust**.

<CardGroup cols={2}>
  <Card title="TypeScript SDK" icon="js" href="https://github.com/helius-labs/helius-sdk#webhooks">
    The TypeScript SDK provides powerful abstractions for webhooks.
  </Card>

  <Card title="Rust SDK" icon="rust" href="https://github.com/helius-labs/helius-rust-sdk">
    Our Rust SDK offers native Rust support for Helius webhooks.
  </Card>
</CardGroup>

The SDKs provide powerful abstractions that enhance the functionality of webhooks.

## Example Uses

- **Bots**
  - When an NFT is listed on marketplace X, trigger an "NFT buy" action.
  - When a margin position is unhealthy, trigger a "liquidation" action.
- **Monitoring & Alerts**
  - When a program emits a certain log, it triggers PagerDuty integration.
  - When a token account balance changes by more than X%, use Dialect to communicate a warning action.
- **Event-driven Indexing**
  - When any transaction occurs for a given program, send it directly to your database or backend.
- **Notifications & Activity Tracking**
  - When transferring from wallet X to wallet Y — send a Slack notification or email.
- **Analytics & Logs**
  - When event X happens, send it to an ETL pipeline or persist it directly on Helius to view trends over time.
- **Workflow Automation**
  - When event X happens, trigger any set of actions.

# FAQ

> Have a question about Helius webhooks?

## What is the retry policy for webhooks?

Currently, we resend unacknowledged webhook events once per minute for three minutes. We also offer customizable retry policies for enterprise plans.

## When does the Webhook send a notification?

Webhooks notify as soon as a transaction is confirmed.

## What is the difference between "raw" and "enhanced" webhooks?

Raw webhooks are regular Solana transactions. When a transaction occurs for the given addresses in a raw webhook, those transactions will be directly sent to the webhook URL supplied by the user.\
\
Enhanced webhooks are for Helius' interpreted transaction types. We parse over 100 types of Solana transactions, including NFT listings, DeFi swaps, Solana transfers, etc., and abstract these into our own schema. If you want to listen for any transaction and don't want Helius abstractions, use raw webhooks. If you want built-in transaction type detectio&#x6E;**, use enhanced webhooks.**

## **Are webhooks available on Devnet?**

Yes!

## How many addresses can I input for 1 webhook?

Up to 100,000 addresses.

## How can I verify that the webhook came from Helius?

You can specify an authorization header when creating (or updating) a webhook. Helius will include set the value in the `Authorization` header when sending data to your webhook.

## Can I input "localhost" for my webhook URL?

No! This is a very common mistake. We can not detect your own local servers from just "localhost."

## Can I monitor an entire NFT collection?

Yes, you can! See the [Helius SDK](https://github.com/helius-labs/helius-sdk#collection-webhooks) for a code example.

## Do webhooks post failed transactions?

It depends on the type. Enhanced webhooks do not, but raw webhooks do!

# How to get Assets

> Learn how to retrieve and query data for all Solana assets including NFTs and SPL tokens using Helius APIs

<Note>
  **Quick Reference**: Use `getAsset` for single assets, `getAssetsByOwner` for wallet holdings, `searchAssets` for filtered queries, and access real-time price data for Jupiter verified tokens.
</Note>

The Helius Digital Asset Standard (DAS) API provides powerful tools for reading and querying both NFT and token data on Solana. This guide shows you how to work with different types of Solana assets effectively.

<CardGroup cols={2}>
  <Card title="Query NFTs" icon="image" href="#working-with-nfts-and-digital-collectibles">
    Retrieve, search, and manage NFT data and collections
  </Card>

  <Card title="Access SPL Tokens" icon="coins" href="#working-with-spl-tokens">
    Get token balances, accounts, and holder information
  </Card>

  <Card title="Token Pricing" icon="chart-line" href="#price-data-for-jupiter-verified-tokens">
    Access real-time price data for Jupiter verified tokens
  </Card>

  <Card title="API Reference" icon="code" href="/api-reference/das">
    View detailed API documentation
  </Card>
</CardGroup>

## Price Data for Jupiter Verified Tokens

```typescript
const fetchTokenPriceData = async () => {
  const response = await fetch(
    "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getAsset",
        params: {
          id: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // Bonk token mint address
          displayOptions: {
            showFungibleTokens: true,
          },
        },
      }),
    },
  );

  const data = await response.json();

  // Calculate market cap
  if (data.result?.token_info?.price_info) {
    const marketCap =
      data.result.token_info.price_info.price_per_token *
      data.result.token_info.supply;
    console.log(`Market Cap: $${marketCap.toLocaleString()}`);
  }

  return data;
};
```

<Card title="API Reference" horizontal icon="code" href="/api-reference/das/getasset">
  View detailed documentation for getAsset
</Card>

### Response Structure

The price data is available in the response under `token_info.price_info`:

```json
{
  "token_info": {
    "symbol": "Bonk",
    "supply": 8881594973561640000,
    "decimals": 5,
    "token_program": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "price_info": {
      "price_per_token": 0.0000192271,
      "currency": "USDC"
    }
  }
}
```

### Calculating Market Cap

To calculate a token's market cap, multiply its price by the total supply:

```typescript
const marketCap = pricePerToken * supply;
```

This calculation gives you the total market valuation of the token.

## Working with NFTs and Digital Collectibles

The DAS API offers several methods for working with NFTs and digital collectibles. These methods allow you to retrieve individual assets, query by owner or creator, and verify on-chain authenticity.

<Tabs>
  <Tab title="Get Single NFT">
    <div>
      <h3>Getting a Single NFT</h3>
      <p>Retrieve comprehensive data for a specific NFT:</p>

      ```typescript
      const getNFT = async (mintAddress) => {
        const response = await fetch('https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "getAsset",
            params: {
              id: mintAddress,
            },
          }),
        });

        const data = await response.json();
        return data;
      };

      // Example usage
      getNFT("F9Lw3ki3hJ7PF9HQXsBzoY8GyE6sPoEZZdXJBsTTD2rk");
      ```
    </div>

  </Tab>

  <Tab title="Find by Owner">
    <div>
      <h3>Finding NFTs by Owner</h3>
      <p>Retrieve all NFTs owned by a specific wallet address:</p>

      ```typescript
      const getNFTsByOwner = async (ownerAddress) => {
        const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "getAssetsByOwner",
            params: {
              ownerAddress: ownerAddress,
              page: 1,
              limit: 10,
            },
          }),
        });

        const data = await response.json();
        return data;
      };

      // Example usage
      getNFTsByOwner("86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY");
      ```
    </div>

  </Tab>

  <Tab title="Advanced Search">
    <div>
      <h3>Searching Assets with Advanced Filters</h3>
      <p>Search for assets by various attributes with detailed filters:</p>

      ```typescript
      const searchAssets = async (params) => {
        const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "searchAssets",
            params: params,
          }),
        });

        const data = await response.json();
        return data;
      };

      // Example: Find all NFTs owned by an address
      searchAssets({
        ownerAddress: "86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY",
        tokenType: "all",
        limit: 50,
      });
      ```
    </div>

  </Tab>
</Tabs>

<CardGroup cols={3}>
  <Card title="getAsset" icon="image" href="/api-reference/das/getasset">
    Detailed data for a single asset
  </Card>

  <Card title="getAssetsByOwner" icon="user" href="/api-reference/das/getassetsbyowner">
    All assets owned by an address
  </Card>

  <Card title="searchAssets" icon="magnifying-glass" href="/api-reference/das/searchassets">
    Filter assets by multiple criteria
  </Card>
</CardGroup>

### Advanced NFT Query Methods

<Tabs>
  <Tab title="By Creator">
    ```typescript
    const getAssetsByCreator = async (creatorAddress) => {
      const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "getAssetsByCreator",
          params: {
            creatorAddress: creatorAddress,
            page: 1,
            limit: 100,
          },
        }),
      });
      
      const data = await response.json();
      return data;
    };

    // Example usage
    getAssetsByCreator("9uBX3ASjxWvNBAD1xjbVaKA74mWGZys3RGSF7DdeDD3F");
    ```

  </Tab>

  <Tab title="By Collection">
    ```typescript
    const getAssetsByCollection = async (collectionAddress) => {
      const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "getAssetsByGroup",
          params: {
            groupKey: "collection",
            groupValue: collectionAddress,
            page: 1,
            limit: 100,
          },
        }),
      });
      
      const data = await response.json();
      return data;
    };

    // Example usage
    getAssetsByCollection("J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w");
    ```

  </Tab>

  <Tab title="Transaction History">
    ```typescript
    const getNFTTransactionHistory = async (mintAddress) => {
      const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "getSignaturesForAsset",
          params: {
            id: mintAddress,
            page: 1,
            limit: 100,
          },
        }),
      });
      
      const data = await response.json();
      return data;
    };

    // Example usage
    getNFTTransactionHistory("FNt6A9Mfnqbwc1tY7uwAguKQ1JcpBrxmhczDgbdJy5AC");
    ```

  </Tab>

  <Tab title="On-Chain Proof">
    ```typescript
    const getNFTProof = async (mintAddress) => {
      const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "1",
          method: "getAssetProof",
          params: {
            id: mintAddress,
          },
        }),
      });
      
      const proof = await response.json();
      return proof;
    };

    // Example usage
    getNFTProof("Bu1DEKeawy7txbnCEJE4BU3BKLXaNAKCYcHR4XhndGss");
    ```

  </Tab>
</Tabs>

<CardGroup cols={4}>
  <Card title="By Creator" icon="user" href="/api-reference/das/getassetsbycreator">API Reference</Card>
  <Card title="By Collection" icon="layer-group" href="/api-reference/das/getassetsbygroup">API Reference</Card>
  <Card title="Transaction History" icon="history" href="/api-reference/das/getsignaturesforasset">API Reference</Card>
  <Card title="On-Chain Proof" icon="check-double" href="/api-reference/das/getassetproof">API Reference</Card>
</CardGroup>

## Working with SPL Tokens

SPL tokens can be queried through multiple methods in the Helius API. These methods let you check balances, find token accounts, and get token metadata.

### Common SPL Token Operations

<Tabs>
  <Tab title="Token Balance">
    ```typescript
    const getTokenBalance = async (tokenAccountAddress) => {
      const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'getTokenAccountBalance',
          params: [tokenAccountAddress]
        })
      });
      
      const data = await response.json();
      return data;
    };

    // Example usage
    getTokenBalance("3emsAVdmGKERbHjmGfQ6oZ1e35dkf5iYcS6U4CPKFVaa");
    ```

    <Card title="API Reference" horizontal icon="code" href="/api-reference/rpc/http/gettokenaccountbalance">
      View getTokenAccountBalance documentation
    </Card>

  </Tab>

  <Tab title="Tokens by Owner">
    ```typescript
    const getTokensByOwner = async (ownerAddress) => {
      const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'getTokenAccountsByOwner',
          params: [
            ownerAddress,
            {
              programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
            },
            {
              encoding: 'jsonParsed'
            }
          ]
        })
      });
      
      const data = await response.json();
      return data;
    };

    // Example usage
    getTokensByOwner("86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY");
    ```

    <Card title="API Reference" horizontal icon="code" href="/api-reference/rpc/http/gettokenaccountsbyowner">
      View getTokenAccountsByOwner documentation
    </Card>

  </Tab>

  <Tab title="Token Supply">
    ```typescript
    const getTokenSupply = async (mintAddress) => {
      const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'getTokenSupply',
          params: [mintAddress]
        })
      });
      
      const data = await response.json();
      return data;
    };

    // Example usage
    getTokenSupply("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
    ```

    <Card title="API Reference" horizontal icon="code" href="/api-reference/rpc/http/gettokensupply">
      View getTokenSupply documentation
    </Card>

  </Tab>

  <Tab title="Largest Holders">
    ```typescript
    const getTokenLargestAccounts = async (mintAddress) => {
      const response = await fetch("https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'getTokenLargestAccounts',
          params: [mintAddress]
        })
      });
      
      const data = await response.json();
      return data;
    };

    // Example usage
    getTokenLargestAccounts("he1iusmfkpAdwvxLNGV8Y1iSbj4rUy6yMhEA3fotn9A");
    ```

    <Card title="API Reference" horizontal icon="code" href="/api-reference/rpc/http/gettokenlargestaccounts">
      View getTokenLargestAccounts documentation
    </Card>

  </Tab>
</Tabs>

### Advanced SPL Token Queries

You can also find all accounts holding a specific token mint:

```typescript
const getTokenAccountsByMint = async (mintAddress) => {
  const response = await fetch(
    "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getTokenAccountsByOwner",
        params: [
          "CEXq1uy9y15PL2Wb4vDQwQfcJakBGjaAjeuR2nKLj8dk", // Owner address
          {
            mint: mintAddress,
          },
          {
            encoding: "jsonParsed",
          },
        ],
      }),
    },
  );

  const data = await response.json();
  return data;
};

// Example usage
getTokenAccountsByMint("8wXtPeU6557ETkp9WHFY1n1EcU6NxDvbAggHGsMYiHsB");
```

## Best Practices

When working with the DAS API, keep these best practices in mind:

1. **Use pagination** for methods that return large data sets
2. **Handle errors gracefully** by implementing try/catch blocks
3. **Cache responses** when appropriate to reduce API calls
4. **Respect rate limits** to avoid disruptions in your application
5. **Verify Jupiter price data** is available before calculating market cap

## FAQ

<AccordionGroup>
  <Accordion title="How do I get all NFTs for a wallet?">
    Use the `getAssetsByOwner` method with the wallet address. Be sure to implement pagination if the wallet might contain many assets.
  </Accordion>

  <Accordion title="Can I get price data for any token?">
    Price data is only available for tokens that are verified on Jupiter. Check if `token_info.price_info` exists in the response.
  </Accordion>

  <Accordion title="How do I find the largest holders of a token?">
    Use the `getTokenLargestAccounts` method with the token's mint address to retrieve a list of the largest holder accounts.
  </Accordion>

  <Accordion title="What's the difference between getAsset and searchAssets?">
    `getAsset` retrieves data for a single asset by its mint address, while `searchAssets` allows you to query multiple assets using various filters.
  </Accordion>
</AccordionGroup>

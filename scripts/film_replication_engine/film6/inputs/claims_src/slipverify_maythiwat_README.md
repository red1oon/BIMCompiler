# Slip Verify SDK

Unified SDK for verifying Thai bank & e-wallet transfer slip QR codes

## Features

- **Unified Interface**: Use a single `inquiry` function with various providers.
- **Payload Validation**: Uses `promptparse` internally to ensure payloads are structurally valid before hitting the provider APIs.
- **Flexible & Extensible**: Easily switch between providers, or implement your own.
- **TypeScript Support**: Fully typed out of the box.

## Requirements

- **Node.js** >= 18 (uses native `fetch`)
- **Bun** >= 1.0

> This SDK is designed for **server-side use only**. It handles sensitive credentials and should not be used in client-side environments.

## Installation

```bash
npm install slipverify
```

## Supported Providers

**Bank Providers** (Bank Slip QR):

| Provider | Credentials                | Sandbox (via `env`) |
| -------- | -------------------------- | ------------------- |
| `scb`    | `apiKey`, `apiSecret`      | ✅                  |
| `kbank`  | `clientId`, `clientSecret` | ✅                  |

**3rd Party Providers** (Bank Slip QR):

| Provider   | Credentials                |
| ---------- | -------------------------- |
| `rdcw`     | `clientId`, `clientSecret` |
| `slipok`   | `branchId`, `apiKey`       |
| `thunder`  | `apiKey`                   |
| `easyslip` | `accessToken`              |

**Non-Bank Providers:**

| Provider    | Credentials   |
| ----------- | ------------- |
| `truemoney` | `accessToken` |

## Usage

```typescript
import { inquiry, type SlipVerifyError } from 'slipverify'
import { kbank } from 'slipverify/providers'

const provider = kbank({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  env: 'sandbox',
})

try {
  const result = await inquiry({
    provider,
    payload: '00020101021129370016A00000067701...',
  })

  if (result.valid) {
    console.log('Slip is valid!', result.data)
  } else {
    console.log('Slip is invalid.')
  }
} catch (error) {
  if (error instanceof SlipVerifyError) {
    console.error(error.message) // "kbank API error (HTTP 401)"
    console.error(error.provider) // "kbank"
    console.error(error.response) // { status, headers, body }
  }
}
```

### Other Providers

```typescript
import { inquiry } from 'slipverify'
import {
  scb,
  rdcw,
  slipok,
  thunder,
  easyslip,
  truemoney,
} from 'slipverify/providers'

// SCB
await inquiry({
  provider: scb({ apiKey: '...', apiSecret: '...', env: 'sandbox' }),
  payload: '00020101021129370016A00000067701...',
})

// RDCW
await inquiry({
  provider: rdcw({ clientId: '...', clientSecret: '...' }),
  payload: '00020101021129370016A00000067701...',
})

// SlipOK
await inquiry({
  provider: slipok({ branchId: '...', apiKey: '...' }),
  payload: '00020101021129370016A00000067701...',
})

// Thunder
await inquiry({
  provider: thunder({ apiKey: '...' }),
  payload: '00020101021129370016A00000067701...',
})

// EasySlip
await inquiry({
  provider: easyslip({ accessToken: '...' }),
  payload: '00020101021129370016A00000067701...',
})

// TrueMoney
await inquiry({
  provider: truemoney({ accessToken: '...' }),
  payload: '0049000201...',
})
```

## Error Handling

All API errors throw `SlipVerifyError` with full HTTP response context:

```typescript
try {
  const result = await inquiry({ provider, payload })
} catch (error) {
  if (error instanceof SlipVerifyError) {
    error.message // "kbank API error (HTTP 401)"
    error.provider // "kbank"
    error.response // { status: 401, headers: {...}, body: {...} }
  }
}
```

## Custom Providers

Implement the `Provider` interface to create your own:

```typescript
import { inquiry, type Provider, type ProviderResult } from 'slipverify'

const custom: Provider = {
  name: 'custom',
  inquiry: async (payload: string): Promise<ProviderResult> => {
    return {
      valid: true,
      data: {
        /* ... */
      },
    }
  },
}

const result = await inquiry({ provider: custom, payload: '...' })
```

## License

This project is MIT licensed (see [LICENSE.md](LICENSE.md)).

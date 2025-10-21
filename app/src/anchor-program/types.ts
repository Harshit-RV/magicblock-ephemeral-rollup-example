/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/anchor_calculator.json`.
 */
export type AnchorCalculator = {
  "address": "5cmQHS2mVhgkyfh2sNdtdMSMadLpSj2N3Gjc6QJhn6Cn",
  "metadata": {
    "name": "anchorCalculator",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "increment",
      "discriminator": [
        11,
        18,
        104,
        9,
        104,
        174,
        59,
        33
      ],
      "accounts": [
        {
          "name": "counter",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  100,
                  97,
                  45,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "newAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  100,
                  97,
                  45,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "newAccount",
      "discriminator": [
        176,
        95,
        4,
        118,
        91,
        177,
        125,
        232
      ]
    }
  ],
  "types": [
    {
      "name": "newAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};

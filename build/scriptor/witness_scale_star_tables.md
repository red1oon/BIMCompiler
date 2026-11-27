| metric | N=M=10 | N=M=100 | N=M=1000 (INCONCLUSIVE) |
|---|---|---|---|
| EDGE station: bytes downloaded, Visit #1 (catch-up) | 384071 | 4514145 | 45816693 |
| EDGE station: bytes downloaded, Visit #2 (steady) | 103900 | 589793 | n/a |
| EDGE station: objects fetched, Visit #1 | 34 | 394 | 3994 |
| EDGE station: objects fetched, Visit #2 | 24 | 204 | n/a |
| EDGE station: ops delivered (placed) | 200 | 2000 | n/a |
| EDGE station: ops accepted | 16 | 16 | n/a |
| EDGE station: ops refused | 184 | 1984 | n/a |
| EDGE station: comm-log DB bytes | 540672 | 4511744 | n/a |
| EDGE station: Visit ms, Visit #1 | 417 | 2999 | 48313 |
| EDGE station: Visit ms, Visit #2 | 179 | 1358 | n/a |
| EDGE borrower: bytes downloaded V1 | 440910 | 4578726 | 45958676 |
| EDGE borrower: bytes downloaded V2 | 69127 | 555020 | n/a |
| EDGE borrower: ops delivered (placed) | 200 | 2000 | n/a |
| EDGE borrower: accepted | 4 | 4 | n/a |
| EDGE borrower: refused | 196 | 1996 | n/a |
| EDGE borrower: comm-log DB bytes | 540672 | 4521984 | n/a |
| RELAY objects stored (day) | 44 | 404 | n/a |
| RELAY bytes stored (day) | 674100 | 6365784 | n/a |
| RELAY of which heads (objects) | 21 | 201 | n/a |
| RELAY of which heads (bytes) | 10548 | 103000 | n/a |
| RELAY objects listed per steady Visit | 43 | 403 | n/a |
| HQ engine: fold ms of the day inbound (sync+project) | 314 | 3294 | 43437 |
| HQ engine: ops received | 170 | 1700 | 17000 |
| HQ engine: replies authored ms (N movements + 2M loan ops) | 630 | 46553 | 5313096 |
| HQ engine: enrol ms per device (roster growth) | 39 | 105 | 908 |
| HQ engine: comm-log DB bytes | 495616 | 4038656 | 39444480 |
| process heap MB at end (engine parent) | 20 | 48 | n/a |
| wall seconds of the engine point | 6 | 122 | 10250 |
| CONTROL planted op: counter moved by | 1 | 1 | n/a |
| MUTANT scope-off: accepted (mutant) vs real 17 | 201 | 2001 | n/a |

| model layer (head office) | cached N=10 | shipped N=10 | cached N=100 | cached N=1000 (STOPPED) |
|---|---|---|---|---|
| tickets imported | 30 | 10 | 300 | 3000 |
| Import POS Sales ms per ticket (all in, incl. login-context builds) | 125 | 8767 | 263 | 2147 |
| Import POS Sales ms per ticket (ex login-context build) | 125 | 150 | 263 | 2147 |
| ms per ticket, first round (ex ctx) | 177 | 200 | 156 | 656 |
| ms per ticket, last round (ex ctx) | 119 | 101 | 389 | 3774 |
| login-context share of Import POS Sales ms (%) | 0 | 98 | 0 | n/a |
| deposit ms per ticket (I_Order+I_Payment, ML.save) | 3 | 8 | 1 | n/a |
| invoice copy+Complete ms (micro) | 22 | 48 | 23 | 23 |
| slips imported (Import Payment 343) | 10 | 5 | 100 | 1000 |
| Import Payment ms per slip | 27 | 422 | 96 | 849 |
| Replenish Report ms (ONE branch, MMM) | 74 | 2088 | 76 | 78 |
| Tenant Accounting Processor ms | 9984 | 4067 | 250794 | n/a |
|   documents posted | 191 | 73 | 1811 | n/a |
|   ms per document | 52 | 56 | 138 | n/a |
|   Fact_Acct rows added | 830 | 302 | 6022 | n/a |
| model-layer ms measured (imports+payments+replenish+acct) | 14092 | 95941 | 339368 | n/a |
| heap MB at end | 26 | 50 | 193 | n/a |
| model DB bytes | 30060544 | 29753344 | 32985088 | n/a |
| wall seconds | 20 | 102 | 347 | n/a |

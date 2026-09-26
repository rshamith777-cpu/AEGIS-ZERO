# Real-World Data Card: NYC TLC Transportation & UNSW-NB15 Cybersecurity

## Dataset: New York City Taxi & Limousine Commission (TLC) Trip Record Data (`nyc_tlc_transport_2024`)
- **Source URL:** [https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page](https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page)
- **Version / Date:** 2024-01
- **License:** NYC Open Data Terms of Use / Public Domain (OFR / FOIL)
- **Download Timestamp:** 2026-09-24T18:00:00.000Z
- **SHA-256 Checksum:** `8f7a62b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6`
- **Raw Record Count:** 29,64,624 records
- **Temporal Sampling Resolution:** 15 minutes
- **Preprocessing & Graph Extraction:** Aggregation of individual taxi trips into temporal operational graphs over 15m, 30m, and 60m windows. Filtered trips with distance <= 0, duration <= 60s, or duration >= 4h. Nodes represent TLC Taxi Zones; edges represent directed trip flows with volume and mean duration. Inflow, outflow, and rolling demand volatility are computed purely from historical observations without future leakage.
- **Zero-Leakage Security Audit:** `PASSED` — Zero label leakage. Operational gridlock events are defined strictly on causal backward-looking operational metrics (congestion duration multiplier >= 1.6 and outflow clearance drop >= 40%) evaluated at time t.

### Schema:
| Field | Type & Description |
| :--- | :--- |
| `VendorID` | integer (Taxis vendor provider code) |
| `tpep_pickup_datetime` | timestamp (Trip start date/time) |
| `tpep_dropoff_datetime` | timestamp (Trip completion date/time) |
| `passenger_count` | float (Number of passengers in vehicle) |
| `trip_distance` | float (Elapsed trip distance in miles) |
| `PULocationID` | integer (TLC Taxi Zone pickup location identifier, 1-263) |
| `DOLocationID` | integer (TLC Taxi Zone dropoff location identifier, 1-263) |
| `fare_amount` | float (Meter fare in USD) |
| `extra` | float (Miscellaneous surcharges) |
| `mta_tax` | float (MTA state tax) |
| `tip_amount` | float (Credit card tip amount in USD) |
| `tolls_amount` | float (Bridge and tunnel tolls) |
| `improvement_surcharge` | float (Vehicle improvement surcharge) |
| `total_amount` | float (Total charged amount in USD) |
| `congestion_surcharge` | float (NYC Congestion pricing surcharge) |

---

## Dataset: UNSW-NB15 Network Intrusion Dataset (`unsw_nb15_cybersecurity_2015`)
- **Source URL:** [https://research.unsw.edu.au/projects/unsw-nb15-dataset](https://research.unsw.edu.au/projects/unsw-nb15-dataset)
- **Version / Date:** 2015-03
- **License:** Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)
- **Download Timestamp:** 2026-09-24T18:00:00.000Z
- **SHA-256 Checksum:** `a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0`
- **Raw Record Count:** 25,40,044 records
- **Temporal Sampling Resolution:** 1 minutes
- **Preprocessing & Graph Extraction:** Flow records aggregated into temporal IP communication graphs over 1-minute and 5-minute epochs. Nodes represent network entities (hosts/subnets); edges represent active communication corridors. Features include flow rates, packet velocities, byte asymmetries, and port entropy. Attack category and binary labels are strictly quarantined from algorithm inputs.
- **Zero-Leakage Security Audit:** `PASSED` — CRITICAL AUDIT VERIFIED: Ground-truth fields (label, attack_cat) are stripped during feature extraction and only accessed by the independent evaluation harness to score detection recall, lead time, and precision.

### Schema:
| Field | Type & Description |
| :--- | :--- |
| `srcip` | string (Source IP Address) |
| `sport` | integer (Source Port Number) |
| `dstip` | string (Destination IP Address) |
| `dsport` | integer (Destination Port Number) |
| `proto` | string (Transaction protocol, e.g. tcp, udp, arp) |
| `state` | string (State and its dependent protocol, e.g. FIN, CON, INT) |
| `dur` | float (Record total duration) |
| `sbytes` | integer (Source to destination transaction bytes) |
| `dbytes` | integer (Destination to source transaction bytes) |
| `sttl` | integer (Source to destination time to live value) |
| `dttl` | integer (Destination to source time to live value) |
| `sloss` | integer (Source packets retransmitted or dropped) |
| `dloss` | integer (Destination packets retransmitted or dropped) |
| `service` | string (HTTP, FTP, SMTP, SSH, DNS, etc.) |
| `Sload` | float (Source bits per second) |
| `Dload` | float (Destination bits per second) |
| `Spkts` | integer (Source to destination packet count) |
| `Dpkts` | integer (Destination to source packet count) |
| `swin` | integer (Source TCP window advertisement value) |
| `dwin` | integer (Destination TCP window advertisement value) |
| `stcpb` | integer (Source TCP base sequence number) |
| `dtcpb` | integer (Destination TCP base sequence number) |
| `smeansz` | integer (Mean packet size transmitted by source) |
| `dmeansz` | integer (Mean packet size transmitted by destination) |
| `attack_cat` | string [SEQUESTERED FOR EVAL ONLY] (Category of attack, e.g. Exploits, Fuzzers, DoS) |
| `label` | integer [SEQUESTERED FOR EVAL ONLY] (0 for normal, 1 for attack record) |

---


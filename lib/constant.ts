
import { Cluster, PublicKey } from "@solana/web3.js";

export const SEED_CONFIG = "config";
export const SEED_MARKET = "market";
export const SEED_USERINFO = "userinfo";

export const TEST_YES_NAME = "Agree";
export const TEST_YES_SYMBOL = "agree";
export const TEST_YES_URI =
  "https://gateway.irys.xyz/GwKuTp6xH8FktZcLfF9Uk7kPZX5iME5DsrPU2nVe6nWM";

export const TEST_NO_NAME = "Disagree";
export const TEST_NO_SYMBOL = "disagree";
export const TEST_NO_URI =
  "https://gateway.irys.xyz/AQtBhVsa5h6oj2XnBoEZu6xscRpzAYUKDrRAVnu3gK6E";

export const TEST_VIRTUAL_RESERVES = 20_000_000_000;
export const TEST_TOKEN_SUPPLY = 1_000_000_000_000_000;
export const TEST_DECIMALS = 6;

export const TEST_INITIAL_VIRTUAL_TOKEN_RESERVES = 1_000_000_000_000_000;
export const TEST_INITIAL_VIRTUAL_SOL_RESERVES = 20_000_000_000;
export const TEST_INITIAL_REAL_TOKEN_RESERVES = 10_000_000_000;

const cluster: Cluster = "devnet";


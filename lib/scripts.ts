import { BN, Program } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";

import { PredictionMarket } from "../target/types/prediction_market";
import {
  SEED_MARKET,
  SEED_CONFIG,
  SEED_USERINFO,
} from "./constant";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const createConfigTx = async (
  admin: PublicKey,

  newConfig: any,

  connection: Connection,
  program: Program<PredictionMarket>
) => {
  const [configPda, _] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  );

  console.log("configPda: ", configPda.toBase58());

  const tx = await program.methods
    .configure(newConfig)
    .accounts({
      payer: admin,
    })
    .transaction();

  console.log("configPda after: ", configPda.toBase58());

  tx.feePayer = admin;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};

export const createMarketTx = async (

  yes_symbol: string,
  yes_uri: string,

  user: PublicKey,
  teamWallet: PublicKey,
  noToken: PublicKey,

  connection: Connection,
  program: Program<PredictionMarket>
) => {
  const yes_tokenKp = Keypair.generate();

  console.log("🚀 ~ yes_tokenKp:", yes_tokenKp.publicKey.toBase58());

  const startSlot = await connection.getSlot();  // Get current slot
  const endSlot = startSlot + 1000;  // Set ending slot (1000 slots later)

  // Send the transaction to launch a token
  const tx = await program.methods
    .createMarket(
      //  metadata
      {
        yesSymbol: yes_symbol,
        yesUri: yes_uri,
        startSlot: new BN(startSlot),
        endingSlot: new BN(startSlot + 300),
      }
    )
    .accounts({
      yesToken: yes_tokenKp.publicKey,
      noToken,//no_tokenKp.publicKey,
      creator: user,
      teamWallet: teamWallet,
    })
    .transaction();

  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(yes_tokenKp);
  // tx.partialSign(no_tokenKp);

  return { tx, yes_tokenKp };
};

export const mintNoTokenTx = async (
  no_symbol: string,
  no_uri: string,

  user: PublicKey,

  connection: Connection,
  program: Program<PredictionMarket>
) => {

  const no_tokenKp = Keypair.generate();
  console.log("🚀 ~ no_tokenKp:", no_tokenKp.publicKey.toBase58());

  // Send the transaction to launch a token
  const tx = await program.methods
    .mintNoToken(
      //  metadata
      no_symbol,
      no_uri,
    )
    .accounts({
      noToken: no_tokenKp.publicKey,
      creator: user,
    })
    .transaction();
  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(no_tokenKp);

  // const sim = await connection.simulateTransaction(tx)
  // console.log('no token createion sim', sim)
  return { tx, no_tokenKp };
};

export const swapTx = async (
  user: PublicKey,
  yes_token: PublicKey,
  no_token: PublicKey,

  amount: number,
  style: number,
  token_type: number,

  connection: Connection,
  program: Program<PredictionMarket>
) => {
  const [configPda, _] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  );
  const configAccount = await program.account.config.fetch(configPda);

  const tx = await program.methods
    .swap(new BN(amount), style, token_type, new BN(0))
    .accounts({
      teamWallet: configAccount.teamWallet,
      user,
      noToken: no_token,
      yesToken: yes_token,
    })
    .transaction();

  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};

export const resolutionTx = async (
  user: PublicKey,
  admin: PublicKey,

  yes_token: PublicKey,
  no_token: PublicKey,

  connection: Connection,
  program: Program<PredictionMarket>
) => {
  console.log("🚀 ~ resolutionTx ~ user:", user.toBase58());

  const marketPda = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_MARKET), yes_token.toBytes(), no_token.toBytes()],
    program.programId
  )[0];

  console.log("🚀 ~ resolutionTx ~ marketPda:", marketPda.toBase58())
  const marketAccount = await program.account.market.fetch(marketPda);
  console.log("🚀 ~ resolutionTx ~ marketAccount:", marketAccount)


  const [userInfoPda, _] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_USERINFO), user.toBytes(), marketPda.toBytes()],
    program.programId
  );
  console.log("🚀 ~ resolutionTx ~ userInfoPda:", userInfoPda.toBase58())
  const userInfoAccount = await program.account.userInfo.fetch(userInfoPda);
  console.log("🚀 ~ userInfoAccount:", userInfoAccount)

  let token_type;

  if (marketAccount.realNoTokenReserves > marketAccount.realYesTokenReserves) {
    token_type = 0;
    console.log("🚀 ~ No win token_type:", token_type);
  } else if (marketAccount.realNoTokenReserves < marketAccount.realYesTokenReserves) {
    token_type = 1;
    console.log("🚀 ~ Yes win token_type:", token_type)
  } else {
    token_type = 2;
    console.log("🚀 ~ Yes & No token_type:", token_type)
  }

  const tx = await program.methods
    .resolution(new BN(userInfoAccount.yesBalance), new BN(userInfoAccount.noBalance), token_type, false)
    .accounts({
      user,
      noToken: no_token,
      yesToken: yes_token,
      authority: admin,
    })
    .transaction();

  tx.feePayer = admin;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};


export const addLiquidityTx = async (
  user: PublicKey,
  yes_token: PublicKey,
  no_token: PublicKey,

  amount: number,

  connection: Connection,
  program: Program<PredictionMarket>
) => {

  const [configPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  );
  const configAccount = await program.account.config.fetch(configPda);
  console.log("🚀 ~ configAccount:", configAccount)

  console.log("🚀 ~ resolutionTx ~ user:", user.toBase58());
  const marketPda = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_MARKET), yes_token.toBytes(), no_token.toBytes()],
    program.programId
  )[0];
  console.log("🚀 ~ resolutionTx ~ marketPda:", marketPda.toBase58())
  const marketAccount = await program.account.market.fetch(marketPda);
  console.log("🚀 ~ resolutionTx ~ marketAccount:", marketAccount)

  const tx = await program.methods
    .addLiquidity(new BN(amount))
    .accounts({
      teamWallet: configAccount.teamWallet,
      user,
      noToken: no_token,
      yesToken: yes_token,
    })
    .transaction();

  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};


export const withdrawLiquidityTx = async (
  user: PublicKey,
  yes_token: PublicKey,
  no_token: PublicKey,

  amount: number,

  connection: Connection,
  program: Program<PredictionMarket>
) => {

  const [configPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_CONFIG)],
    program.programId
  );
  const configAccount = await program.account.config.fetch(configPda);
  console.log("🚀 ~ configAccount:", configAccount)

  console.log("🚀 ~ resolutionTx ~ user:", user.toBase58());
  const marketPda = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_MARKET), yes_token.toBytes(), no_token.toBytes()],
    program.programId
  )[0];
  console.log("🚀 ~ resolutionTx ~ marketPda:", marketPda.toBase58())
  const marketAccount = await program.account.market.fetch(marketPda);
  console.log("🚀 ~ resolutionTx ~ marketAccount:", marketAccount)

  const [userInfoPda, bump_] = PublicKey.findProgramAddressSync(
    [Buffer.from(SEED_USERINFO), user.toBytes(), marketPda.toBytes()],
    program.programId
  );
  console.log("🚀 ~ resolutionTx ~ userInfoPda:", userInfoPda.toBase58());
  let userInfoAccount;
  try {
    userInfoAccount = await program.account.userInfo.fetch(userInfoPda);
  } catch {
    throw new Error(
      "WITHDRAWNOTLPERROR: You must add liquidity first before withdrawing. Run:\n" +
        `  yarn script addlp -y ${yes_token.toBase58()} -n ${no_token.toBase58()} -a <amount>`
    );
  }
  console.log("🚀 ~ userInfoAccount:", userInfoAccount);

  if (!userInfoAccount.isLp) {
    throw new Error(
      "WITHDRAWNOTLPERROR: You must add liquidity first before withdrawing. Run:\n" +
        `  yarn script addlp -y ${yes_token.toBase58()} -n ${no_token.toBase58()} -a ${amount}`
    );
  }

  const tx = await program.methods
    .withdrawLiquidity(new BN(amount))
    .accounts({
      teamWallet: configAccount.teamWallet,
      user,
      noToken: no_token,
      yesToken: yes_token,
    })
    .transaction();

  tx.feePayer = user;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  return tx;
};
import { BrowserProvider, Wallet } from "ethers";

export function getWallet(privateKey) {
  return new Wallet(privateKey);
}

export function validatePrivateKey(value) {
  try {
    new Wallet(value);
    return true;
  } catch (error) {
    return false;
  }
}

export async function getConnectedAddress(useMetamask, requestConnection = true) {
  if (!useMetamask || !window.ethereum) {
    return "";
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send(
      requestConnection ? "eth_requestAccounts" : "eth_accounts",
      []
    );
    return accounts[0] ?? "";
  } catch (error) {
    console.info("wallet connection rejected");
    return "";
  }
}

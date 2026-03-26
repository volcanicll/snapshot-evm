import axios from "axios";
import { ethers } from "ethers";

const snapshotHubUrl = "https://hub.snapshot.org/graphql";
const snapshotMessageUrl = "https://hub.snapshot.org/api/msg";
const snapshotScoreUrl = "https://score.snapshot.org";
const rpcProvider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth");

function normalizeProposal(item, fallbackSpace) {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    choices: item.choices,
    start: item.start,
    end: item.end,
    space: item.space?.id ?? fallbackSpace,
    vote: item.type === "approval" || item.type === "ranked-choice" ? "all" : "1",
    select: true,
    status_code: "",
    status_message: "",
  };
}

async function postGraphql(query) {
  const response = await axios.post(snapshotHubUrl, { query });
  return response.data.data;
}

async function sendVoteRequest(data) {
  try {
    const response = await axios.post(snapshotMessageUrl, data, {
      headers: {
        "content-type": "application/json",
      },
    });

    if (response.data?.id) {
      return {
        status_code: "success",
        status_message: "Successfully voted.",
      };
    }

    return {
      status_code: "error",
      status_message: "Vote failed: invalid Snapshot response.",
    };
  } catch (error) {
    return {
      status_code: "error",
      status_message:
        "Vote failed: " +
        (error.response?.data?.error_description ||
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message),
    };
  }
}

async function signVotePayload(account, payload, useMetamask) {
  const { domain, types, message } = payload.data;

  if (useMetamask) {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
    return signer._signTypedData(domain, types, message);
  }

  const signer = new ethers.Wallet(account.privateKey, rpcProvider);
  return signer._signTypedData(domain, types, message);
}

function buildVotePayload(account, proposal) {
  const checksumAddress = ethers.utils.getAddress(account.address);
  const isMultiChoice =
    proposal.type === "approval" || proposal.type === "ranked-choice";

  return {
    address: checksumAddress,
    data: {
      domain: {
        name: "snapshot",
        version: "0.1.4",
      },
      types: {
        Vote: [
          { name: "from", type: "address" },
          { name: "space", type: "string" },
          { name: "timestamp", type: "uint64" },
          { name: "proposal", type: "string" },
          { name: "choice", type: isMultiChoice ? "uint32[]" : "uint32" },
          { name: "reason", type: "string" },
          { name: "app", type: "string" },
        ],
      },
      message: {
        space: proposal.space,
        proposal: proposal.id,
        choice: isMultiChoice
          ? proposal.choices.map((_, index) => index + 1)
          : Number(proposal.vote),
        app: "snapshot",
        reason: "",
        from: checksumAddress,
        timestamp: Math.floor(Date.now() / 1000),
      },
    },
  };
}

export async function fetchActiveProposals(spaceId) {
  const data = await postGraphql(`query Proposals {
    proposals(
      first: 20
      skip: 0
      where: { space_in: ["${spaceId}"], state: "active" }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      title
      body
      choices
      start
      end
      snapshot
      state
      author
      type
      app
      space {
        id
        name
      }
    }
  }`);

  return data.proposals.map((item) => normalizeProposal(item, spaceId));
}

export async function fetchActiveProposalsForSelection(selectedSpace, spacesList) {
  if (selectedSpace === "all") {
    const nestedProposals = await Promise.all(
      spacesList.map((space) => fetchActiveProposals(space.id))
    );

    return nestedProposals
      .flat()
      .sort((left, right) => right.start - left.start);
  }

  return fetchActiveProposals(selectedSpace);
}

export async function hasVoted(address, proposalId) {
  const data = await postGraphql(`query Votes {
    votes(
      first: 1
      where: {
        proposal: "${proposalId}"
        voter: "${address}"
      }
    ) {
      id
    }
  }`);

  return data.votes.length > 0;
}

export async function getProposal(proposalId) {
  const response = await fetch(snapshotHubUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operationName: "Proposal",
      variables: { id: proposalId },
      query: `query Proposal($id: String!) {
        proposal(id: $id) {
          id
          snapshot
          network
          type
          strategies {
            name
            network
            params
          }
          space {
            id
            name
          }
        }
      }`,
    }),
  });

  const data = await response.json();
  return data.data.proposal;
}

export async function getVotingPower(proposalId, address) {
  const proposal = await getProposal(proposalId);
  const response = await fetch(snapshotScoreUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "get_vp",
      params: {
        space: proposal.space.id,
        delegation: false,
        network: proposal.network,
        snapshot: Number.parseInt(proposal.snapshot, 10),
        strategies: proposal.strategies,
        address,
      },
    }),
  });

  const data = await response.json();
  return data.result?.vp ?? 0;
}

export async function voteOnProposal(account, proposal, useMetamask) {
  const payload = buildVotePayload(account, proposal);
  payload.sig = await signVotePayload(account, payload, useMetamask);
  return sendVoteRequest(payload);
}

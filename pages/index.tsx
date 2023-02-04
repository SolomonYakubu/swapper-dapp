declare var window: any;
import type { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import ExportedImage from "next-image-export-optimizer";
import { RiSwapFill } from "react-icons/ri";
import { ethers } from "ethers";
import { Zoom, Bounce, Fade, Roll } from "react-reveal";
import Layout from "../components/Layout";
import qs from "qs";
import Web3 from "web3";

import Header from "../components/Header";
import tokensList from "../token.json";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { AiOutlineClose, AiOutlineSetting } from "react-icons/ai";
const Swap: NextPage = () => {
  // WBTC as the default output token

  interface TokenList {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
  }
  const [signer, setSigner] = useState<any>({});
  const [tokenList, setTokenList] = useState<TokenList[]>([]);
  const [hideModal, setHideModal] = useState(true);
  const [hideSettings, setHideSettings] = useState(true);
  const [estimatedGas, setEstimatedGas] = useState("0");
  const [buyAmount, setBuyAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState<number>(1);
  const [side, setSide] = useState("sell");
  const [search, setSearch] = useState<{
    symbol: string;
    logoURI: any;
    address: string;
    decimals: number;
  }>();
  const [selectedSellToken, setSelectedSellToken] = useState<{
    symbol: string;
    logoURI: string;
    address: string;
    decimals: number;
  }>();
  const [selectedBuyToken, setSelectedBuyToken] = useState<{
    symbol: string;
    logoURI: string;
    address: string;
    decimals: number;
  }>();
  const [fromAmount, setFromAmount] = useState("");
  const [connected, setConnected] = useState(false);
  const slippageValues = [1, 3, 5];
  const connectToMetamask = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        console.log("connecting");
        // Requests that the user provides an Ethereum address to be identified by. The request causes a MetaMask popup to appear. Read more: https://docs.metamask.io/guide/rpc-api.html#eth-requestaccounts
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.log(error);
        return;
      }
      setConnected(true);
      // If connected, enable "Swap" button
    } else {
      alert("Please Install Metamask");
    }
  };
  const getTokenList = async () => {
    // const res = await fetch("https://tokens.1inch.eth.link");
    // const data = await res.json();
    setTokenList(tokensList);

    console.log(tokenList);
  };
  async function getPrice() {
    console.log("Getting price");
    if (!fromAmount || !selectedSellToken) return;
    setLoading(true);
    // Only fetch price if from token, to token, and from token amount have been filled in ]
    let amount = Number(Number(fromAmount) * 10 ** selectedSellToken?.decimals);
    const params = {
      sellToken: selectedSellToken?.address,
      buyToken: selectedBuyToken?.address,
      sellAmount: amount,
    };
    // Fetch the swap price.
    const response = await fetch(
      `https://api.0x.org/swap/v1/price?${qs.stringify(params)}`
    );
    const swapPriceJSON = await response.json();
    console.log("Price: ", swapPriceJSON);
    setLoading(false);
    // Use the returned values to populate the buy Amount and the estimated gas in the UI

    selectedBuyToken?.decimals &&
      setBuyAmount(
        "" + swapPriceJSON.buyAmount / 10 ** selectedBuyToken?.decimals
      );
    //  document.getElementById("gas_estimate").innerHTML =
    setEstimatedGas(swapPriceJSON.estimatedGas); // The amount is calculated from the smallest base unit of the token. We get this by multiplying the (from amount) x (10 to the power of the number of decimal places)
  }

  async function getQuote(account) {
    console.log("Getting price");
    if (!fromAmount || !selectedSellToken) return;
    // Only fetch price if from token, to token, and from token amount have been filled in ]
    let amount = String(Number(fromAmount) * 10 ** selectedSellToken?.decimals);
    const params = {
      sellToken: selectedSellToken?.address,
      buyToken: selectedBuyToken?.address,
      sellAmount: amount,
      expectedSlippage: slippage,
      // takerAddress: account,
    };
    // Fetch the swap price.
    const response = await fetch(
      `https://api.0x.org/swap/v1/quote?${qs.stringify(params)}`
    );

    const swapQuoteJSON = await response.json();
    console.log("Quote: ", swapQuoteJSON);
    // Use the returned values to populate the buy Amount and the estimated gas in the UI

    selectedBuyToken?.decimals &&
      setBuyAmount(
        "" + swapQuoteJSON.buyAmount / 10 ** selectedBuyToken?.decimals
      );
    //  document.getElementById("gas_estimate").innerHTML =
    setEstimatedGas(swapQuoteJSON.estimatedGas);
    return swapQuoteJSON;
    // The amount is calculated from the smallest base unit of the token. We get this by multiplying the (from amount) x (10 to the power of the number of decimal places)
  }

  async function trySwap() {
    // Perform the swap
    let accounts = await window.ethereum.request({ method: "eth_accounts" });
    let takerAddress = accounts[0];
    // Log the the most recently used address in our MetaMask wallet
    console.log("takerAddress: ", takerAddress);
    // Pass this as the account param into getQuote() we built out earlier. This will return a JSON object trade order.
    const swapQuoteJSON = await getQuote(takerAddress);
    const erc20abi: any = [
      {
        inputs: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "symbol", type: "string" },
          { internalType: "uint256", name: "max_supply", type: "uint256" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "burn",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "burnFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "subtractedValue", type: "uint256" },
        ],
        name: "decreaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "addedValue", type: "uint256" },
        ],
        name: "increaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "sender", type: "address" },
          { internalType: "address", name: "recipient", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
    // Set up approval amount for the token we want to trade from
    const fromTokenAddress = selectedSellToken?.address;
    // In order for us to interact with a ERC20 contract's method's, need to create a web3 object. This web3.eth.Contract object needs a erc20abi which we can get from any erc20 abi as well as the specific token address we are interested in interacting with, in this case, it's the fromTokenAddrss
    // Read More: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#web3-eth-contract
    const web3 = new Web3(Web3.givenProvider);
    const ERC20TokenContract = new web3.eth.Contract(
      erc20abi,
      fromTokenAddress
    );
    console.log("setup ERC20TokenContract: ", ERC20TokenContract);
    const maxApproval = ethers.constants.MaxInt256;
    console.log("approval amount: ", maxApproval);
    // Grant the allowance target (the 0x Exchange Proxy) an  allowance to spend our tokens. Note that this is a txn that incurs fees.
    const tx = await ERC20TokenContract.methods
      .approve(swapQuoteJSON.allowanceTarget, maxApproval)
      .send({ from: takerAddress })
      .then((tx) => {
        console.log("tx: ", tx);
      });
    const receipt = await web3.eth.sendTransaction(swapQuoteJSON);
    console.log("receipt: ", receipt);
  }
  useEffect(() => {
    // getTokenList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    getPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSellToken, selectedBuyToken, fromAmount]);
  return (
    <div>
      <Header />
      <Layout>
        {/* <Header /> */}

        <section
          className=" px-6  w-full bg-gray-200 flex flex-col justify-center items-center bg-cover bg-right md:bg-fixed min-h-[calc(100vh-64px)] py-6"
          id=""
        >
          <button
            onClick={() => connectToMetamask()}
            className="font-[Questrial]  hover:bg-gradient-to-tr hover:bg-primary bg-grad bg-gradient-to-bl from-black to-[#262626] font-bold  text-white shadow-xl p-3 px-2 rounded-xl mr-1 border-none  self-end mb-10 "
          >
            {connected ? "Connected" : "Connect Wallet"}
          </button>
          <Fade top>
            {/* <h3 className="text-center text-5xl md:text-6xl mb-7   p-1 font-extrabold  text-zinc-800  font-[Questrial]">
              Swapper
            </h3> */}
          </Fade>
          <div className=" flex flex-col justify-center items-center md:w-1/3 shadow-lg group p-8 px-4 md:py-12 w-full bg-white relative rounded-lg">
            <div className="z-20 w-full flex flex-col justify-center items-center">
              <p className="font-[Questrial] text-black font-bold self-start">
                Pay
              </p>
              <div className="flex w-full justify-between items-center rounded-lg text-white bg-gray-300 z-20 border border-solid border-gray-500">
                <div
                  className="text-lg w-1/3 cursor-pointer overflow-hidden"
                  onClick={() => {
                    getTokenList();
                    setSide("sell");
                    setHideModal(false);
                  }}
                >
                  {(selectedSellToken && (
                    <div className=" bg-gray-400 text-white  p-3  rounded-l-lg flex gap-1 justify-start items-center w-full">
                      <ExportedImage
                        src={selectedSellToken.logoURI}
                        alt=""
                        width={30}
                        height={30}
                        unoptimized={true}
                        className=" rounded-full  border-secondary border-2 border-solid"
                      />

                      <p className="text-lg text-white font-[Questrial]">
                        {selectedSellToken.symbol}
                      </p>
                    </div>
                  )) || (
                    <div className="  bg-gray-400 text-white  p-3  rounded-l-lg flex items-center">
                      Select <MdOutlineKeyboardArrowDown size={25} />
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  className="p-3 w-2/5 bg-inherit outline-none text-right text-lg rounded-r-lg text-black"
                  onChange={(e) => {
                    setFromAmount(e.target.value);
                  }}
                  onBlur={() => getPrice()}
                />
              </div>

              <RiSwapFill
                size={40}
                className="text-zinc-400 rounded-full text-center self-center m-1"
              />
              <p className="font-[Questrial] text-black font-bold self-start">
                Recieve
              </p>

              <div className="flex w-full justify-between items-center rounded-lg text-white bg-gray-300 z-20 border border-solid border-gray-500">
                <div
                  className="text-lg bg-none w-1/3 cursor-pointer overflow-hidden"
                  id="buy"
                  onClick={() => {
                    getTokenList();
                    setSide("buy");
                    setHideModal(false);
                  }}
                >
                  {(selectedBuyToken && (
                    <div className=" bg-gray-400 text-white  p-3  rounded-l-lg flex gap-1 justify-start items-center w-full">
                      <ExportedImage
                        src={selectedBuyToken.logoURI}
                        alt=""
                        width={30}
                        height={30}
                        unoptimized={true}
                        className=" rounded-full  border-secondary border-2 border-solid"
                      />

                      <p className="text-lg text-white font-[Questrial]">
                        {selectedBuyToken.symbol}
                      </p>
                    </div>
                  )) || (
                    <div className=" bg-gray-400 text-white  p-3  rounded-l-lg flex items-center">
                      Select <MdOutlineKeyboardArrowDown size={25} />
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  disabled
                  value={(loading && "fetching amount") || buyAmount}
                  placeholder="0.00"
                  className="p-3 w-2/5 bg-inherit text-right text-lg rounded-r-lg text-black"
                />
              </div>
              <button
                onClick={() => (connected ? trySwap() : connectToMetamask())}
                className=" text-xl hover:bg-gradient-to-bl w-full my-5 font-[Questrial] font-bold bg-black  text-white p-3 px-4  rounded-lg  flex-1 text-center transition-all duration-700 "
              >
                {(connected && "Swap") || "Connect Wallet"}
              </button>
              <div className="border border-solid border-black w-full rounded-lg">
                <p className="my-1 mt-5 text-black self-start px-2 flex items-center justify-between text-sm">
                  Estimated Gas:{" "}
                  <span>{(loading && "estimating gas") || estimatedGas}</span>
                </p>
                <p className="my-1  text-black self-start px-2 flex items-center justify-between text-sm">
                  Expected Receive amount:{" "}
                  <span>{(+buyAmount).toFixed(2)}</span>
                </p>
                <p className=" my-1 text-black self-start px-2 flex items-center justify-between text-sm">
                  Slippage:{" "}
                  <span className="flex items-center justify-center gap-1 font-bold">
                    {" "}
                    <AiOutlineSetting
                      size={15}
                      className=" text-black"
                      onClick={() => setHideSettings(false)}
                    />
                    {slippage}%
                  </span>
                </p>
                <p className=" my-1 mt-5 text-black self-start px-2 border-t border-solid border-black text-sm">
                  Swapper will find the best price for you
                </p>
              </div>
            </div>
            {/* Settings Modal */}
            <div
              className={`${
                (hideSettings && "scale-0 ") || "flex scale-100"
              } cursor-pointer flex-col justify-center items-center gap-5 absolute top-24 z-30 bg-zinc-400 w-11/12 p-5 transition-all duration-500`}
            >
              <p className="font-bold text-lg">Set Slippage</p>
              <div className="flex">
                {slippageValues.map((item, index) => (
                  <div
                    className={`${
                      item === slippage &&
                      "bg-blue-300 bg-opacity-60 rounded-lg"
                    } p-2 font-bold`}
                    key={index}
                    onClick={() => setSlippage(item)}
                  >
                    {item}%
                  </div>
                ))}
              </div>
              <input
                type="number"
                className="p-3 text-white"
                placeholder="Custom Value"
                onChange={(e) => setSlippage(+e.target.value)}
              />
              <button
                onClick={() => setHideSettings(true)}
                className="text-xl  w-full my-5 font-[Questrial] bg-black border-2 border-solid border-black text-white p-3  rounded  flex-1 text-center "
              >
                Done
              </button>
            </div>
            {/* Modal */}
            <div
              className={`${
                (hideModal && "scale-0") || "flex scale-100"
              } cursor-pointer flex-col bg-zinc-700 text-white h-96 absolute top-12 left-5 overflow-x-hidden w-48 z-30  bg-opacity-90 gap-2 p-4 py-8 transition-all duration-500`}
            >
              <AiOutlineClose
                size={30}
                className=" bg-blue-600 p-1 bg-opacity-80 self-end rounded-full"
                onClick={() => setHideModal(true)}
              />
              <input
                type="text"
                className="w-full p-3 bg-bg2 text-white"
                placeholder="Search"
                onChange={(e) =>
                  setSearch(
                    tokenList?.find((item) =>
                      item.symbol
                        .toLowerCase()
                        .includes(e.target.value.toLowerCase())
                    )
                  )
                }
              />
              <div
                className={`${
                  (search && "flex") || "hidden"
                } items-center justify-start gap-2 border-2 border-solid border-white p-2`}
                onClick={() => {
                  if (!search) return;
                  setHideModal(true);

                  side === "sell"
                    ? setSelectedSellToken({
                        symbol: search.symbol,
                        logoURI: search.logoURI,
                        address: search.address,
                        decimals: search.decimals,
                      })
                    : setSelectedBuyToken({
                        symbol: search.symbol,
                        logoURI: search.logoURI,
                        address: search.address,
                        decimals: search.decimals,
                      });
                }}
              >
                <ExportedImage
                  src={search?.logoURI}
                  alt="-"
                  width={20}
                  height={20}
                  unoptimized={true}
                  className=" rounded-full  border-secondary border-2 border-solid"
                />

                <p className="text-lg text-white font-[Questrial]">
                  {search?.symbol}
                </p>
              </div>
              <div className="flex flex-col gap-2 overflow-scroll overflow-x-hidden h-3/4">
                {tokenList?.map((item, index) => (
                  <div
                    className="flex items-center justify-start gap-2"
                    key={index}
                    onClick={() => {
                      setHideModal(true);
                      side === "sell"
                        ? setSelectedSellToken({
                            symbol: item.symbol,
                            logoURI: item.logoURI,
                            address: item.address,
                            decimals: item.decimals,
                          })
                        : setSelectedBuyToken({
                            symbol: item.symbol,
                            logoURI: item.logoURI,
                            address: item.address,
                            decimals: item.decimals,
                          });
                    }}
                  >
                    <ExportedImage
                      src={item.logoURI}
                      alt="-"
                      width={20}
                      height={20}
                      unoptimized={true}
                      className=" rounded-full  border-secondary border-2 border-solid"
                    />

                    <p className="text-lg text-white font-[Questrial]">
                      {item.symbol}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="  bg-bg2 text-center p-1 text-zinc-500">
          Powered by <span className="text-white"> Swapper</span>
        </section>
      </Layout>
    </div>
  );
};

export default Swap;

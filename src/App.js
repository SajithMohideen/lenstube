import React, { useEffect, useState, useRef } from "react";
import './App.css';
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

//Adding Minting constants
const truncate = (input, len) =>
	input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;


function App() {
	//Mint Dapp code starts
	const dispatch = useDispatch();
	const blockchain = useSelector((state) => state.blockchain);
	const data = useSelector((state) => state.data);
	const [claimingNft, setClaimingNft] = useState(false);
	const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
	const [mintAmount, setMintAmount] = useState(1);
	const [CONFIG, SET_CONFIG] = useState({
		CONTRACT_ADDRESS: "",
		SCAN_LINK: "",
		NETWORK: {
			NAME: "",
			SYMBOL: "",
			ID: 0,
		},
		NFT_NAME: "",
		SYMBOL: "",
		MAX_SUPPLY: 1,
		WEI_COST: 0,
		DISPLAY_COST: 0,
		GAS_LIMIT: 0,
		MARKETPLACE: "",
		MARKETPLACE_LINK: "",
		SHOW_BACKGROUND: false,
	});

	const claimNFTs = () => {
		let cost = CONFIG.WEI_COST;
		let gasLimit = CONFIG.GAS_LIMIT;
		let totalCostWei = String(cost * mintAmount);
		let totalGasLimit = String(gasLimit * mintAmount);
		console.log("Cost: ", totalCostWei);
		console.log("Gas limit: ", totalGasLimit);
		setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
		setClaimingNft(true);
		blockchain.smartContract.methods
			.mint(mintAmount)
			.send({
				gasLimit: String(totalGasLimit),
				to: CONFIG.CONTRACT_ADDRESS,
				from: blockchain.account,
				value: totalCostWei,
			})
			.once("error", (err) => {
				console.log(err);
				setFeedback("Sorry, something went wrong please try again later.");
				setClaimingNft(false);
			})
			.then((receipt) => {
				console.log(receipt);
				setFeedback(
					`WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io ${CONFIG.MARKETPLACE_LINK} to view it.`
				);
				setClaimingNft(false);
				dispatch(fetchData(blockchain.account));
			});
	};

	const decrementMintAmount = () => {
		let newMintAmount = mintAmount - 1;
		if (newMintAmount < 1) {
			newMintAmount = 1;
		}
		setMintAmount(newMintAmount);
	};

	const incrementMintAmount = () => {
		let newMintAmount = mintAmount + 1;
		if (newMintAmount > 10) {
			newMintAmount = 10;
		}
		setMintAmount(newMintAmount);
	};

	const getData = () => {
		if (blockchain.account !== "" && blockchain.smartContract !== null) {
			dispatch(fetchData(blockchain.account));
		}
	};

	const getConfig = async () => {
		const configResponse = await fetch("/config/config.json", {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});
		const config = await configResponse.json();
		SET_CONFIG(config);
	};

	useEffect(() => {
		getConfig();
	}, []);

	useEffect(() => {
		getData();
	}, [blockchain.account]);


	return (
		<div classNameName="App">

			{/* Home Section */}
			<header id="home">
				<div className="bg-img" style={{ backgroundImage: "url('/config/images/p1.jpg')" }} />
				<nav id="nav" className="navbar nav-transparent">
					<div className="container">
						<div className="navbar-header">
							<div className="navbar-brand">
								<a href="index.html">
									<img className="logo" src="/config/images/lt-logo.png" alt="logo" />
									<img className="logo-alt" src="/config/images/lt-logo-alt.png" alt="logo" />
								</a>
							</div>
							<div className="nav-collapse">
								<span></span>
							</div>
						</div>
						<ul className="main-nav nav navbar-nav navbar-right">
							<li><a href="#home">Home</a></li>
							<li><a href="#minting">Minting</a></li>
							<li><a href="#stream">Stream</a></li>
						</ul>
					</div>
				</nav>
				<div className="home-wrapper">
					<div className="container">
						<div className="row">

							<div className="col-md-10 col-md-offset-1">
								<div className="home-content">
									<h1 className="title-font">LensTube</h1>
									<p className="white-text">Welcome to LensTube
									</p>
									<button className="white-btn"><a href="#minting">Get Started!</a></button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>


			{/* Minting Section */}
			<div id="minting" className="section md-mint-padding" style={{ backgroundImage: "url('/config/images/p1.jpg')" }}>
				<div className="container">
					<s.Screen>
						<s.Container
							flex={1}
							ai={"center"}
							style={{ padding: 10, backgroundColor: "var(--primary)" }}
						>
							<s.SpacerSmall />
							<ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
								<s.Container flex={1} jc={"center"} ai={"center"}>
								</s.Container>
								<s.SpacerLarge />
								<s.Container
									flex={2}
									jc={"center"}
									ai={"center"}
									style={{
										backgroundImage: "url('/config/images/mtv.jpg')",
										padding: 0,
										borderRadius: 30,
										boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
									}}
								>
									<s.TextTitle
										style={{
											textAlign: "center",
											fontSize: 50,
											fontWeight: "bold",
											color: "#000000",
										}}
									>
										{data.totalSupply} / {CONFIG.MAX_SUPPLY}
									</s.TextTitle>
									<s.TextDescription
										style={{
											textAlign: "center",
											color: "#000000",
										}}
									>
										<StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
											{truncate(CONFIG.CONTRACT_ADDRESS, 15)}
										</StyledLink>
									</s.TextDescription>
									<s.SpacerSmall />
									{Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
										<>
											<s.TextTitle
												style={{ textAlign: "center", color: "#000000" }}
											>
												The sale has ended.
											</s.TextTitle>
											<s.TextDescription
												style={{ textAlign: "center", color: "#000000" }}
											>
												You can still find {CONFIG.NFT_NAME} on
											</s.TextDescription>
											<s.SpacerSmall />
											<StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
												{CONFIG.MARKETPLACE}
											</StyledLink>
										</>
									) : (
										<>
											<s.TextTitle
												style={{ textAlign: "center", color: "#000000" }}
											>
												1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
												{CONFIG.NETWORK.SYMBOL}.
											</s.TextTitle>
											<s.SpacerXSmall />
											<s.TextDescription
												style={{ textAlign: "center", color: "#000000" }}
											>
												Excluding gas fees.
											</s.TextDescription>
											<s.SpacerSmall />
											{blockchain.account === "" ||
												blockchain.smartContract === null ? (
												<s.Container ai={"center"} jc={"center"}>
													<s.TextDescription
														style={{
															textAlign: "center",
															color: "#000000",
														}}
													>
														Connect to the {CONFIG.NETWORK.NAME} network
													</s.TextDescription>
													<s.SpacerSmall />
													<StyledButton
														style={{
															textAlign: "center",
															color: "#ffffff",
															backgroundColor: "#252525"
														}}
														onClick={(e) => {
															e.preventDefault();
															dispatch(connect());
															getData();
														}}
													>
														CONNECT
													</StyledButton>
													{blockchain.errorMsg !== "" ? (
														<>
															<s.SpacerSmall />
															<s.TextDescription
																style={{
																	textAlign: "center",
																	color: "#ffffff",
																}}
															>
																{blockchain.errorMsg}
															</s.TextDescription>
														</>
													) : null}
												</s.Container>
											) : (
												<>
													<s.TextDescription
														style={{
															textAlign: "center",
															color: "#ffffff",
														}}
													>
														{feedback}
													</s.TextDescription>
													<s.SpacerMedium />
													<s.Container ai={"center"} jc={"center"} fd={"row"}>
														<StyledRoundButton
															style={{
																textAlign: "center",
																color: "#ffffff",
																backgroundColor: "#252525",
																lineHeight: 0.4
															}}
															disabled={claimingNft ? 1 : 0}
															onClick={(e) => {
																e.preventDefault();
																decrementMintAmount();
															}}
														>
															-
														</StyledRoundButton>
														<s.SpacerMedium />
														<s.TextDescription
															style={{
																textAlign: "center",
																color: "#252525",
															}}
														>
															{mintAmount}
														</s.TextDescription>
														<s.SpacerMedium />
														<StyledRoundButton
															style={{
																textAlign: "center",
																color: "#ffffff",
																backgroundColor: "#252525"
															}}
															disabled={claimingNft ? 1 : 0}
															onClick={(e) => {
																e.preventDefault();
																incrementMintAmount();
															}}
														>
															+
														</StyledRoundButton>
													</s.Container>
													<s.SpacerSmall />
													<s.Container ai={"center"} jc={"center"} fd={"row"}>
														<StyledButton
															style={{
																textAlign: "center",
																color: "#ffffff",
																backgroundColor: "#252525"
															}}
															disabled={claimingNft ? 1 : 0}
															onClick={(e) => {
																e.preventDefault();
																claimNFTs();
																getData();
															}}
														>
															{claimingNft ? "BUSY" : "BUY"}
														</StyledButton>
													</s.Container>
												</>
											)}
										</>
									)}
									<s.SpacerMedium />
								</s.Container>
								<s.SpacerLarge />
								<s.Container flex={1} jc={"center"} ai={"center"}>

								</s.Container>
							</ResponsiveWrapper>
							<s.SpacerMedium />
							<s.Container jc={"center"} ai={"center"} style={{ width: "100%" }}>
								<s.TextDescription
									style={{
										textAlign: "center",
										fontFamily: "HelveticaNeue-Light"
									}}
								>
									<div style={{
										color: "#059", padding: 5, borderRadius: 8,
										width: 600, backgroundColor: "#BEF",
										msAlignSelf: "center", margin: 10,
										boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)"
									}}>
										<i class="fa fa-info-circle"></i>
										We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
										successfully mint your NFT. We recommend that you don't lower the
										gas limit.
									</div>
									<div style={{
										color: "#9F6000", backgroundColor: "#FEEFB3",
										padding: 5, borderRadius: 8, width: 600, msAlignSelf: "center",
										boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)", margin: 10
									}}>
										<i class="fa fa-warning"></i>
										Please make sure you are connected to the right network (
										{CONFIG.NETWORK.NAME} testnet) and the correct address. Please note:
										Once you make the purchase, you cannot undo this action.
									</div>
									<div style={{
										color: "#D8000C", backgroundColor: "#FFBABA",
										padding: 5, borderRadius: 8, width: 600, msAlignSelf: "center",
										boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)", margin: 10
									}}>
										<i class="fa fa-times-circle"></i>
										Please note: Once you make the purchase, you cannot undo this action.
									</div>
								</s.TextDescription>
							</s.Container>
						</s.Container>
					</s.Screen>
				</div>
			</div>


			{/* Streaming Section */}
			<div id="stream" className="section md-padding bg-grey" style={{ backgroundImage: "url('/config/images/p1.jpg')" }}>
				<div className="container">
					<div className="row">
						<div className="section-header text-center">
							<h2 className="title">Live Stream</h2>
						</div>
						<div className="container">
							<div className="row">
								<div className="col-md-10 col-md-offset-1">
									<div className="home-content">
										<div class="videoWrapper">
											<iframe width="560" height="315" src="https://www.youtube.com/embed/eIrMbAQSU34"
												title="YouTube video player" frameborder="0"
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowfullscreen></iframe>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>


			<footer id="footer" className="sm-padding bg-dark">
				<div className="container">
					<div className="row">
						<div className="col-md-12">
							<div class="bg-primary-darker p-5 text-center w-full text-white">
								<a target="_blank" href="https://polygon.technology" rel="noreferrer">
									<span class="text-md block flex items-center justify-center"> <img src="/config/images/polygon.da7b877d.svg" className="polylogo" alt="" /> Powered by Polygon</span>
								</a><br />
								<span class="text-xs">LensTube</span>
							</div>
							{/*<div className="footer-logo">
						<a href="index.html"><img src="/config/images/logo-alt.png" alt="logo" /></a>
					</div>*/}
							<div className="footer-copyright">
								<p>ETHGlobal Hackathon 2022</p>
							</div>
						</div>
					</div>
				</div>
			</footer>

			<div id="back-to-top" />
		</div>
	);

}

export default App;

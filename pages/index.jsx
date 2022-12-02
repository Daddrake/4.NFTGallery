import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { NFTCard } from "./components/nftCard";
import PaginationBar from "./components/Pagination";

const Home = () => {
	const [wallet, setWalletAddress] = useState("");
	const [collection, setCollectionAddress] = useState("");
	const [NFTs, setNFTs] = useState([]);
	const [fetchForCollection, setFetchForCollection] = useState(false);
	const [pageKeys, setPageKeys] = useState([""]);
	const [currentPage, setCurrentPage] = useState(0);

	const API_KEY = "A8A1Oo_UTB9IN5oNHfAc2tAxdR4UVwfM";

	const fetchNFTs = async (e) => {
		const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${API_KEY}/getNFTs/`;
		const fetchURL = !collection
			? `${baseURL}?owner=${wallet}`
			: `${baseURL}?owner=${wallet}&contractAddresses%5B%5D=${collection}`;
		var requestOptions = {
			method: "GET",
		};
		try {
			const nfts = await fetch(fetchURL, requestOptions).then((data) =>
				data.json()
			);

			if (nfts) {
				setNFTs(nfts.ownedNfts);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const fetchNFTsForCollection = async (e, startToken = "", pageIndex = 0) => {
		if (collection) {
			var requestOptions = {
				method: "GET",
			};
			const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${API_KEY}/getNFTsForCollection/`;
			const fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=${"true"}&startToken=${startToken}`;
			try {
				const nfts = await fetch(fetchURL, requestOptions).then((data) =>
					data.json()
				);
				if (nfts) {
					if (nfts.nextToken) {
						setPageKeys((prevKeys) => {
							const newKeys = [...prevKeys];
							newKeys[pageIndex + 1] = nfts.nextToken;

							return newKeys;
						});
					}
					console.log("NFTs in collection:", nfts);
					setNFTs(nfts.nfts);
				}
			} catch (error) {
				console.log(error);
			}
		}
	};

	const onClickPage = (e, pageIndex) => {
		if (currentPage === pageIndex) return;

		try {
			if (fetchForCollection) {
				fetchNFTsForCollection(e, pageKeys[pageIndex], pageIndex);
				console.log("fetchforcollection");
			} else {
				fetchNFTs(e, pageKeys[pageIndex], pageIndex);
				console.log("fetchnfts");
			}
			setCurrentPage(pageIndex);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center py-8 gap-y-3">
			{pageKeys.length > 1 && (
				<PaginationBar
					currentPage={currentPage}
					pageKeys={pageKeys}
					onClickPage={onClickPage}
					className="border-t"
				/>
			)}
			<div className="flex flex-col w-full justify-center items-center gap-y-2">
				<input
					disabled={fetchForCollection}
					className="w-2/5 bg-slate-100 py-2 px-2 rounded-lg text-gray-800 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50"
					onChange={(e) => {
						setWalletAddress(e.target.value);
					}}
					value={wallet}
					type={"text"}
					placeholder="Add your wallet address"
				></input>
				<input
					className="w-2/5 bg-slate-100 py-2 px-2 rounded-lg text-gray-800 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50"
					onChange={(e) => {
						setCollectionAddress(e.target.value);
					}}
					value={collection}
					type={"text"}
					placeholder="Add the collection address"
				></input>
				<label className="text-gray-600 ">
					<input
						onChange={(e) => {
							setFetchForCollection(e.target.checked);
						}}
						type={"checkbox"}
						className="mr-2"
						checked={fetchForCollection}
					></input>
					Fetch for collection
				</label>
				<button
					className={
						"disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5"
					}
					onClick={() => {
						if (fetchForCollection) {
							fetchNFTsForCollection();
						} else {
							fetchNFTs();
						}
					}}
				>
					Get NFTs!{" "}
				</button>
			</div>
			<div className="flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-2 justify-center">
				{!!NFTs.length &&
					NFTs.map((nft, i) => {
						return (
							<NFTCard
								nft={nft}
								key={`${nft.tokenUri.raw}-${i}-${nft.id.tokenId}`}
							></NFTCard>
						);
					})}
			</div>
		</div>
	);
};

export default Home;

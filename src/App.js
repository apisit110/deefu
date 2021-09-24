import { useState, useEffect } from "react";
import "./App.css";
import styled from "styled-components";

import Web3 from "web3";
import axios from "axios";

import { network } from "./assets/network";

const options = {
  chain: network.bsc.mainnet,
  address: "",
};

// const web3 = new Web3(options.chain);
const web3 = new Web3(new Web3.providers.HttpProvider(options.chain));

async function coins_fetch(id) {
  if (id.length > 0) {
    let result = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}`,
      {
        localization: "false",
        tickers: "true",
        market_data: "false",
        community_data: "false",
        developer_data: "false",
        sparkline: "false",
      }
    );
    // console.log(result);
    return result;
  }
}

async function fetch_token_price(tokenid) {
  try {
    let coin_price = await coins_fetch(tokenid);

    let price_multi_market = coin_price.data.tickers.filter(
      (item) =>
        item.is_stale == false &&
        (item.target == "USDT" || item.target == "USDC")
    );
    let token_price_average = price_multi_market.map((item) => item.last);
    if (token_price_average.length > 0) {
      token_price_average =
        token_price_average.reduce((prev, next) => prev + next) /
        price_multi_market.length;
      return {
        image: coin_price.data.image,
        price: token_price_average,
      };
    } else {
      // colsole.log(tokenid);
    }
  } catch (error) {
    console.log("err: " + tokenid);
  }
}

async function main1(wallet) {
  let My_Portfolio = [];
  let My_Wallet = wallet;

  let Currency_Symbol_Balance = await web3.eth.getBalance(My_Wallet);
  const Currency_Symbol_balance_format = web3.utils.fromWei(
    Currency_Symbol_Balance
  );
  let Currency_Symbol = "BNB";
  let Curreny_Id = "binancecoin";
  My_Portfolio = {
    symbol: Currency_Symbol,
    balances: parseFloat(Currency_Symbol_balance_format).toFixed(3),
  };

  let result = await fetch_token_price(Curreny_Id);
  if (result?.price !== undefined) {
    My_Portfolio = {
      ...My_Portfolio,
      image: result.image,
      price: parseFloat(result.price).toFixed(2),
      value: (My_Portfolio.balances * result.price).toFixed(3),
    };
  }
  return My_Portfolio;
}

function App() {
  const [input, setInput] = useState();
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    (async () => {
      if (input?.wallet?.length > 0) {
        console.log("Loading... event 1");
        let result_1 = await main1(input.wallet);
        setPortfolio([result_1]);
        console.log("done event 1");
      }
    })();
  }, [input?.wallet]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      let value = event.target.value;
      setInput({ wallet: value });
    }
  };

  return (
    <div>
      <Nav_Flex>
        <Nav_Flex_Left>
          {/* <div><img src={logo} /></div> */}
          <div>
            <a>Deefu</a>
          </div>
        </Nav_Flex_Left>
        <Nav_Flex_Right>{/* <div><a>Home</a></div> */}</Nav_Flex_Right>
        <div>
          <Wrap_InputBox_Input
            name="address"
            placeholder="Search by Address"
            onKeyPress={handleKeyPress}
          />
        </div>
      </Nav_Flex>
      <Blog_Size>
        <Title_Table>Wallet</Title_Table>
        <Table>
          <thead>
            <tr>
              <th>assets</th>
              <th>balances</th>
              <th>price</th>
              <th>value</th>
            </tr>
          </thead>
          <tbody>
            {portfolio &&
              portfolio
                .sort(function (a, b) {
                  return a.value - b.value;
                })
                .map((item, index) => {
                  if (!item.price) {
                    return;
                  }
                  return (
                    <tr key={index}>
                      <td>
                        <Wrap_Symbol>
                          <Size_Symbol>
                            <Size_Symbol_Img src={item.image?.thumb} />
                          </Size_Symbol>
                          <Symbol_Name>{item.symbol}</Symbol_Name>
                        </Wrap_Symbol>
                      </td>
                      <td>{item.balances}</td>
                      <td>{item.price}</td>
                      <td>{item.value}</td>
                    </tr>
                  );
                })}
          </tbody>
        </Table>
      </Blog_Size>
      <footer>
        <span>v1.0.0</span>
        <span> BSC</span>
      </footer>
    </div>
  );
}

const Nav_Flex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 64px;
  box-shadow: rgb(20 100 249) 0px -4px 8px;
`;
const Nav_Flex_Left = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  & a {
    font-weight: 700;
    color: rgb(0, 0, 0);
    text-decoration: none;
    transition: all 0.25s ease 0s;
    margin-left: 0px;
    padding-bottom: 5px;
  }
`;
const Nav_Flex_Right = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  & a {
    font-weight: 700;
    color: rgb(0, 0, 0);
    text-decoration: none;
    transition: all 0.25s ease 0s;
    margin-left: 0px;
    padding-bottom: 5px;
  }
`;
const Blog_Size = styled.div`
  box-sizing: border-box;
  margin: 0 auto;
  padding: 8px;
  min-width: 0px;
  width: 100%;
  max-width: 960px;
  min-height: 100vh;
  position: relative;
`;
const Wrap_InputBox_Input = styled.input`
  width: 300px;
  height: 1.6em;
  padding: 6px 12px;
  border-radius: 40px;
  border: 1px solid rgba(0, 0, 0, 0.25);
`;
const Title_Table = styled.h4`
  padding: 0 1rem;
  margin: 0;
`;
const Table = styled.table`
  width: 100%;
  display: table;
  border-spacing: 0;
  border-collapse: collapse;
  & thead {
    display: table-header-group;
  }
  & thead tr {
    color: inherit;
    display: table-row;
    outline: 0;
    vertical-align: middle;
  }
  & thead tr th {
    font-size: 16px;
    border-bottom: none;

    padding: 0.75rem 1rem;
    white-space: nowrap;

    color: #2e2e2e;
    line-height: 1.5rem;

    text-align: left;
  }
  & tbody {
    display: table-header-group;
  }
  & tbody tr {
    color: inherit;
    display: table-row;
    outline: 0;
    vertical-align: middle;
  }
  & tbody tr td {
    font-size: 16px;
    border-bottom: none;

    padding: 0.75rem 1rem;
    white-space: nowrap;

    color: #2e2e2e;
    line-height: 1.5rem;

    text-align: left;
  }
`;
const Wrap_Symbol = styled.div`
  display: inline-grid;
  gap: 8px;
  align-items: center;
  grid-auto-flow: column;
  justify-content: flex-start;
`;
const Size_Symbol = styled.div`
  display: flex;
  position: relative;
  font-size: 22px;
  align-items: center;
  margin-right: 0px;
`;
const Size_Symbol_Img = styled.img`
  object-fit: cover;
  object-position: center center;
  flex-shrink: 0;
  border-radius: 50%;
  padding: 1px;
  background: white;

  width: 22px;
  height: 22px;
`;
const Symbol_Name = styled.p`
  color: #2e2e2e;

  font-size: 14px;
  line-height: 1.43;
`;

export default App;

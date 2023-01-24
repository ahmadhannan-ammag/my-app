import './App.css';
import { Button } from 'react-bootstrap';
import { AptosClient } from 'aptos';
import React, { useState, useEffect } from 'react';
import BigInt from 'big-integer';
import Form from 'react-bootstrap/Form';


const client = new AptosClient('https://fullnode.devnet.aptoslabs.com/v1');


function App() {

  const [address, setAddress] = useState();
  const [publicKey, setpublicKey] = useState();
  const [isConnected, setisConnected] = useState(false);
  const [network, setnetwork] = useState();


  const handleConnect = async () => {

    if (isConnected) {
      await window.aptos.disconnect().then(() => setisConnected(false))
    } else {
      await window.aptos.connect().then(async () => {
        setisConnected(true)
        getAccount()
      })
      let network = await window.aptos.network();
    }

  }
  const [modules, setmodules] = useState();
  const [balance, setbalance] = useState();
  const [messsage, setmesssage] = useState();
  const [Input, setInput] = useState('');

  const getBalance = async (address) => {
    const resourceType1 = `0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`;
    const resources1 = await client.getAccountResources(address, resourceType1)
    const resource1 = resources1?.find((r) => r.type === resourceType1);
    // const hasModule = modules?.some((m) => m.abi?.name === 'message');
    const data1 = resource1?.data
    const message1 = data1?.coin.value;
    setbalance((message1 * 1) / 100000000)

  }

  const getmessage = async (address) => {
    const resources = await client.getAccountResources(address)

    const resourceType = `${address}::message::MessageHolder`;
    const resource = resources?.find((r) => r.type === resourceType);
    // const hasModule = modules?.some((m) => m.abi?.name === 'message');
    const data = resource?.data
    const message = data?.message;
    // console.log(message)
    setmesssage(message)
  }
  const getAccount = async () => {
    window.aptos.account().then(async (Account) => {
      setAddress(Account.address)
      setpublicKey(Account.publicKey)
      client.getAccountModules(Account.address).then(setmodules)


      getBalance(Account.address)
      getmessage(Account.address)


    })
    await window.aptos.network().then((network) => {
      setnetwork(network)
    })


  }



  useEffect(() => {
    window.aptos.isConnected().then(
      (isConnected) => {
        setisConnected(isConnected)
        isConnected && getAccount()
      }
    )

  }, []);

  const transaction = {
    // reciever address, value
    arguments: [address, '717'],
    function: '0x1::coin::transfer',
    type: 'entry_function_payload',
    type_arguments: ['0x1::aptos_coin::AptosCoin'],
  };

  const sendTransaction = async () => {
    // transaction
    // const transactionHash = await window.aptos.signAndSubmitTransaction(transaction)
    //   .then(console.log)

    // const client = new AptosClient('https://testnet.aptoslabs.com');
    // const txn = await client.waitForTransactionWithResult(
    //   transactionHash.hash,
    // ).then(console.log)



    // const message = 'hello Hassan'

    const transaction = {
      type: "entry_function_payload",
      function: `${address}::message::set_message`,
      arguments: [Input],
      type_arguments: [],
    };


    const transactionn = await window.aptos.signAndSubmitTransaction(transaction);
    setInput('')
    console.log(transactionn)
    getBalance(address)
    getmessage(address)


  }
  window.aptos.onNetworkChange((newNetwork) => {
    getAccount()
  });
  // window.aptos.onDisconnect(() => {
  //   setisConnected(false)
  // });


  window.aptos.onAccountChange((newAccount) => {
    // If the new account has already connected to your app then the newAccount will be returned
    if (newAccount) {
      getAccount()
    } else {
      // Otherwise you will need to ask to connect to the new account
      window.aptos.connect();
    }
  });

  return (
    <div className="App">

      <header className="App-header">
        <h2>Aptos Practice Dapp</h2><br /><br />
        {
          isConnected && <div>
            <h1>Enter your message here</h1><br />
            <input
              onChange={(e) => {
                setInput(e.target.value)

              }
              }
              type="text"
              value={Input}
            />
            <br />
            <br />
            <Button onClick={() => {
              if (Input) {

                sendTransaction()
              } else alert("Please enter a valid message")
            }} variant='secondary'>
              Submit
            </Button>
            <br /><br />
            <h2>Message =>   {messsage}</h2>
            <br />
            <h3>Account Address : {address?.length > 10 ? address?.slice(0, 15) + "..." : address}</h3><br />
            <h4>Public Key : {publicKey?.length > 10 ? publicKey?.slice(0, 15) + "..." : publicKey}</h4><br />
            <h4>Balance : {balance}</h4><br />

            <h4>Network : {network}</h4>
          </div>
        }
        <Button onClick={handleConnect} variant={isConnected ? 'danger' : "success"}>
          {isConnected ? 'Disconnect' : 'Connect to Aptos'}
        </Button>
      </header>
    </div>
  );
}

export default App;

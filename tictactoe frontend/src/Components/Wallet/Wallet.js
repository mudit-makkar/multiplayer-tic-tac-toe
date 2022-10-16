import React, { useEffect,useState } from "react";
import { serverURL } from "../../serverUrl";

export async function getWallet()
{
    const response=await fetch(serverURL+"/wallet",{method:"GET",credentials:"include"});
    const wallet=await response.json();
    return wallet;
}

export default function Wallet()
{
    const [walletAmount,setWalletAmount]=useState(0);

    useEffect(()=>{
        getWallet().then((wallet)=>{
            setWalletAmount(wallet.walletAmount);
        })
    },[])

    return (
        <p style={{paddingLeft:"20px",fontSize:"x-large",color:"#41A372",fontWeight:"bold"}}>Wallet - {walletAmount}</p>
    )
}
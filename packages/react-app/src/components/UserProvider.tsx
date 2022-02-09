import { Dictionary, isEmpty, keyBy, map } from "lodash";
import * as React from "react";
import { ReactNode, useContext, useEffect, useState } from "react";
import { createContext, Dispatch } from "react";
import { usePixelsMetaverse } from "../pixels-metaverse";
import { fetchGetGoodsIdList, fetchRegister, useRequest } from "../hook/api2";
import { useWeb3Info } from "abi-to-request";
import { MaterialItem } from "./Card";
import { useContractRequest, useAbiToRequest, useGetDataAbiToRequest } from "abi-to-request";
import { ethers } from "ethers";
import { SimpleToken_Decimals, SimpleToken_Name, SimpleToken_TotalSupply } from "../client/SimpleToken";

export const UserInfoContext = createContext(
  {} as {
    userInfo: any;
    goodsList: any[];
    setGoodsList: Dispatch<any[]>;
    collectList: any[];
    setCollectList: Dispatch<any[]>;
    goodsId?: number;
    setGoodsId: Dispatch<React.SetStateAction<number | undefined>>;
    register: (arg?: any) => Promise<void>;
    composeList: string[];
    setComposeList: Dispatch<React.SetStateAction<string[]>>;
    goodsListObj: Dictionary<MaterialItem>;
    setGoodsListObj: React.Dispatch<React.SetStateAction<Dictionary<MaterialItem>>>
  },
);

export const useUserInfo = () => useContext(UserInfoContext);

export const UserInfoProvider = ({ children }: { children: ReactNode }) => {
  const [goodsList, setGoodsList] = useState<any[]>([]);
  const [goodsListObj, setGoodsListObj] = useState<Dictionary<MaterialItem>>({});
  const [collectList, setCollectList] = useState<any[]>([]);
  const [goodsId, setGoodsId] = useState<number | undefined>();
  const [composeList, setComposeList] = React.useState<string[]>([])
  const { address, networkId } = useWeb3Info()
  const { contract, etherContract } = usePixelsMetaverse()
  const { contracts } = useContractRequest()
  /* const getUserInfo = useRequest(fetchUserInfo, {
    onSuccess: (res)=>{
      console.log(res, "resssss")
      setUserInfo(res)
    }
  }) */
  console.log(contracts)

  const getUserInfo2 = useAbiToRequest(SimpleToken_Name, {
    onSuccess: (res)=>{
      console.log(res, "resssss")
    }
  })

  const [userInfo, getUserInfo] = useGetDataAbiToRequest(SimpleToken_TotalSupply)
  console.log(userInfo, "userInfo")

  const register = useRequest(fetchRegister, {
    onSuccess: () => {
      address && getUserInfo({ address: address })
    }
  }, [address])

  /* useEffect(()=>{
    const timer = setInterval(()=>{
      getUserInfo({
        address: "0x5D8e5bc8e7013380987367621e195244C65dEbA6"
      })
    }, 5000)
    return ()=>{
      clearInterval(timer)
    } 
  }, [etherContract]) */

  const getGoodsIdList = useRequest(fetchGetGoodsIdList)
  //const getCollectList = useRequest(fetchCollectList)

  useEffect(() => {
    getUserInfo2()
    if (!address) return
    //getCollectList({ address })
  }, [contracts])

  useEffect(() => {
    if (!networkId) return
    setGoodsList([])
    //getGoodsIdList({ setValue: setGoodsList })
  }, [networkId, etherContract])

  useEffect(() => {
    if (!goodsId) return
    //getGoodsInfo({ id: goodsId, setGoodsList })
  }, [goodsId])

  useEffect(() => {
    if (!isEmpty(goodsList)) {
      const obj: Dictionary<MaterialItem> = keyBy(goodsList, (item: MaterialItem) => item?.material?.id);
      const getData = (items: MaterialItem) => {
        const data: MaterialItem[] = []
        const fun = (item: MaterialItem) => {
          if (item?.composes?.length === 0) return
          map(item?.composes, (ite: number) => {
            if (obj[ite]) data.push(obj[ite])
            fun(obj[ite])
          })
        }
        fun(items)
        return data
      }
      map(goodsList, (item: MaterialItem) => {
        const data = getData(item)
        if (isEmpty(data)) obj[item?.material?.id].composeData = [item]
        obj[item?.material?.id].composeData = data;
      })
      setGoodsListObj(obj)
    }
  }, [goodsList])

  return (
    <UserInfoContext.Provider value={{
      userInfo,
      goodsList, setGoodsList,
      goodsId, setGoodsId,
      collectList, setCollectList,
      register,
      composeList, setComposeList,
      goodsListObj, setGoodsListObj
    }}>
      {children}
    </UserInfoContext.Provider>
  )
}
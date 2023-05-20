import React, { useEffect,useState } from 'react';
import { Chart } from 'primereact/chart';
import { filter } from 'lodash';

const TotalAgentsChat = (props) => {
    const[userChats,setuserChats]=useState([])
    const[userNames,setUserNames]=useState([])
    const[isEmpty,setIsEmpty]=useState(false)
    const[loading,setloading]=useState(true)



    useEffect(()=>{
        let chatArray=[0] as any
        let usersArray=[] as any

        let filtered=props.data?.filter(e=>e.chatsUserWise!==0);
        filtered?.forEach(element => {
            chatArray.push(Math.round(element.chatsUserWise))
            usersArray.push(element.userName)
        });

        if(chatArray?.length===0 && usersArray?.length===0){
            setIsEmpty(true)
        }

        setuserChats(chatArray.reverse())
        setUserNames(usersArray.reverse())
        setloading(false)
    },[props.data])


    const chartData = {
        labels: userNames,
        datasets: [
            {
                data:userChats,
                backgroundColor: [
                    "#FF6384","#36A2EB","#FFCE56","#008080","#800080",
                    "#0000FF","#808000","#800000","#808080", "#C0C0C0",
                    "#FF7F50", "#9FE2BF", "#40E0D0", "#FF2A00","#FF5500",
                    "#FF8000", "#FFAA00", "#FFD400", "#FFFF00","#D4FF00",
                    "#AAFF00","#40e0d0","#b17eb1","#f190c1", "#ceaece", 
                    "#b2f7f9","#999999","#94e851", "#002fa7","#c5f5f0",
                    "#bb88ff","#ff0000","#2b5540","#88d4c3","#a91e69",                    
                ],
                hoverBackgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56"
                ]
            }]
    };

    const lightOptions = {
        legend: {
            labels: {
                fontColor: '#495057'
            }
        }
    };



    const EmptyData = {
        labels: ["empty"],
        datasets: [
            {
                data:[1],
                backgroundColor: [
                    "#808080",                    
                ],
                hoverBackgroundColor: [
                    "#808080",                    
                ]
            }]
    };

 

    return (
        <>
            {loading===false?(                     
                <div className="card">
                <h6>Total Chats By Agents</h6>
                {isEmpty===true?(
                <Chart type="pie" data={EmptyData} options={lightOptions} />
                ):(
                <Chart type="pie" data={chartData} options={lightOptions} />
                )}
            </div>
            ):("")}   
       </> 
    )
}

export default TotalAgentsChat
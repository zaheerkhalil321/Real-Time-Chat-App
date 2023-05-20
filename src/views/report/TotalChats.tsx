import React, { useEffect,useState } from 'react';
import { Chart } from 'primereact/chart';
import _ from "lodash";

const TotalChats = (props) => {
    const[totalChats,setTotalChats]=useState([])
    const[totaldays,setTotaldays]=useState([])
    const[loading,setloading]=useState(true)


    useEffect(()=>{
        let chatArray=[] as any
        let daysArray=[] as any
        props.data?.forEach(element => {
            chatArray.push(element.totalChats)
            daysArray.push(element.daydate)
        });
        setTotalChats(chatArray)
        setTotaldays(daysArray)
        setloading(false)
    },[props.data])


    
    const stackedData = {
        labels:totaldays, 
        datasets: [{
            type: 'bar',
            label: 'Chats',
            backgroundColor: '#42A5F5',
            data:totalChats
        }]
    };

    const getLightTheme = () => {      
        let stackedOptions = {
            tooltips: {
                mode: 'index',
                intersect: false
            },
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: false,
                    ticks: {
                        fontColor: '#495057'
                    },
                    gridLines: {
                        color: '#ebedef'
                    }
                }],
                yAxes: [{
                    stacked: false,
                    ticks: {
                        fontColor: '#495057'
                    },
                    gridLines: {
                        color: '#ebedef'
                    }
                }]
            },
            legend: {
                labels: {
                    fontColor: '#495057'
                }
            }
        };
      
        return {
            stackedOptions
        }
    }

    const {stackedOptions } = getLightTheme();
        return (
            <>
            {loading===false?(
                <div className="card">
                    <h6>Total Chats</h6>
                    <Chart type="bar" data={stackedData} options={stackedOptions} />
                </div>
            ):("")}  
           </>
        )
    }
    export default TotalChats
import React, { useEffect,useState } from 'react';
import { Chart } from 'primereact/chart';

const ChatResponseTime = (props) => {
    const[hours,setHours]=useState([])
    const[actualChatResponseTime,setActualChatResponseTime]=useState([])
    const[dealerManaged,setDealerManaged]=useState([])
    const[coManaged,setCoManaged]=useState([])
    const[isEmpty,setIsEmpty]=useState(false)
    const[loading,setloading]=useState(true)


    useEffect(()=>{
        let hoursArray=[] as any
        let actualChatResponseArray=[] as any
        let dealerManagedArray=[] as any
        let coManagedArray=[] as any
        
        props.data?.forEach(element => {
            hoursArray.push(element.hourly)

            if(element.actualChatResponse===null){
                actualChatResponseArray.push(0)
            }
            else{
                actualChatResponseArray.push(parseInt(element.actualChatResponse))
            }

            if(element.dealerManaged===null){
                dealerManagedArray.push(0)
            }
            else{
                dealerManagedArray.push(parseInt(element.dealerManaged))
            }

            if(element.coManaged===null){
                coManagedArray.push(0)
            }
            else{
                coManagedArray.push(parseInt(element.coManaged))
            }
        });

     

        setHours(hoursArray)
        setActualChatResponseTime(actualChatResponseArray)
        setDealerManaged(dealerManagedArray)
        setCoManaged(coManagedArray)
        setloading(false)

    },[props.data])

  
    const multiAxisData = {
        labels:hours,
        datasets: [{
            label: 'Actual Response Time',
            backgroundColor:'#999999',
            yAxisID: 'y-axis-1',
            data:actualChatResponseTime
        }, {
            label: 'Dealer Managed',
            backgroundColor: '#42A5F5',
            yAxisID: 'y-axis-2',
            data: dealerManaged
        },{
            label: 'Co Managed',
            backgroundColor: '#4B4848',
            yAxisID: 'y-axis-2',
            data: coManaged
        }]
    };

    const getLightTheme = () => {       
       
        let multiAxisOptions = {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: true
            },
            scales: {
                xAxes: [{
                    ticks: {
                        fontColor: '#495057'
                    },
                    gridLines: {
                        color: '#ebedef'
                    }
                }],
                yAxes: [{
                    type: 'linear',
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                    ticks: {
                        min: 0,
                        max: 100,
                        fontColor: '#495057'
                    },
                    gridLines: {
                        color: '#ebedef'
                    }
                },
                {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    gridLines: {
                        drawOnChartArea: false,
                        color: '#ebedef'
                    },
                    ticks: {
                        min: 0,
                        max: 100,
                        fontColor: '#495057'
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
            multiAxisOptions
        }
    }

    const { multiAxisOptions,} = getLightTheme();

        return (
            <>
                {loading===false?(                     
                    <div className="card">
                        <h6>Chat Response Time</h6>
                        <Chart type="bar" data={multiAxisData} options={multiAxisOptions} />
                    </div> 
                ):("")}    
            </>
        )
    }

    export default ChatResponseTime
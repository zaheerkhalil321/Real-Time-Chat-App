import React,{useEffect,useState} from 'react';
import { Chart } from 'primereact/chart';

const TotalDuration = (props) => {
    const[avgChatDuration,setAvgChatDuration]=useState([])
    const[totaldays,setTotaldays]=useState([])
    const[loading,setloading]=useState(true)


    useEffect(()=>{
        let avgChatArray=[] as any
        let daysArray=[] as any
        props.data?.forEach(element => {
            if(element.avgChatDuration===null){
                avgChatArray.push(0)
            }
            else{
            avgChatArray.push(parseInt(element.avgChatDuration))
            }
            daysArray.push(element.daydate)
        });       
        setAvgChatDuration(avgChatArray)
        setTotaldays(daysArray)
        setloading(false)
    },[props.data])


    
    const stackedData = {
        labels:totaldays, 
        datasets: [{
            type: 'bar',
            label: 'Minutes',
            backgroundColor: '#42A5F5',
            data:avgChatDuration
        }]
    };

    const getLightTheme = () => {      
        let stackedOptions = {
            tooltips: {
                mode: 'index',
                intersect: true
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
                    <>      
                    <div className="card">
                        <h6>Chat Duration</h6>
                        <Chart type="bar" data={stackedData} options={stackedOptions} />
                    </div>         
                </>
                ):("")}    
            </>     
        )
    }

    export default TotalDuration
import React,{useEffect,useState} from 'react';
import { Chart } from 'primereact/chart';

const ChatAvailability = (props) => {
    const[avgLoggedTimeResponse,setAvgLoggedTimeResponse]=useState([])
    const[hours,setHours]=useState([])
    const[totaldays,setTotaldays]=useState([])
    const[loading,setloading]=useState(true)

    
    useEffect(()=>{
        let avgloggedTimeArray=[] as any
        let hourArray=[] as any
        let daysArray=[] as any

        // props.data?.forEach(element => {
        //     if(element.avgChatResponse===null){
        //         avgChatArray.push(0)
        //     }
        //     else{
        //         avgChatArray.push(parseInt(element.avgChatResponse))
        //     }
        //     hourArray.push(parseInt(element.hourly))
        // });
        // setAvgChatResponse(avgChatArray.reverse())
        // setHours(hourArray.reverse())

       //...............get days 
        props.dayWiseReportData?.forEach(element => {            
            daysArray.push(element.daydate)
            avgloggedTimeArray.push(element.avgDayLoggedInTime)
        });
        setTotaldays(daysArray)
        setAvgLoggedTimeResponse(avgloggedTimeArray)
        setloading(false)
    },[props.data,props.dayWiseReportData])


    
    const stackedData = {
        labels:totaldays, 
        datasets: [{
            type: 'bar',
            label: 'Hours',
            backgroundColor: '#42A5F5',
            data:avgLoggedTimeResponse
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
        {loading===false && props.loading===false?(
            <>      
            <div className="card">
                <h6>Chat Availability</h6>
                <Chart type="bar" data={stackedData} options={stackedOptions} />
            </div>        
        </>
        ):("")}    
       </>
    )
}
export default ChatAvailability

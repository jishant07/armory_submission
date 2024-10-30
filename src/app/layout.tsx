"use client"
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Home from './Home';
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { message, open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export default function RootLayout() {
  const granularityList = [
    {
      tag: '1s',
      multiplier: 1000
    },
    {
      tag: '100ms',
      multiplier: 100
    },
    {
      tag: '10ms',
      multiplier: 10
    },
    {
      tag: '1ms',
      multiplier: 1
    }
  ]
  const [data, setData] = useState<{name : string, value: number}[]>([])
  const [granularity, setGranularity] = useState<number>(granularityList[0].multiplier)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isReChunking, setIsReChunking] = useState<boolean>(false)
  const [sliderValue, setSliderValue] = useState<number>(0)

  const handleGranularityChange = (event: any) => {
    setGranularity(parseInt(event))
  }
  
  const handleSlider = (event:any) =>{
    setSliderValue(event)
  }

  const reChunkData = async (local_granularity: number) =>{
    setIsReChunking(true)
    let response: number[] = await invoke('process_data_chunks', {chunkSize : local_granularity * 4000})
    let processedData = response.map((value: number, index: number) => {
      return {
        name: `${((granularity / 1000) + index) - 1} ${granularity == 1000 ? 's' : 'ms'}`,
        value
      }
    })
    setData(processedData)
    setIsReChunking(false)
  }

  useEffect(()=>{
    reChunkData(granularity)
  },[granularity])

  const handleBrowse = async () => {
    setIsLoading(true)
    const selected = await open({
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });
    if (selected) {
      let response: number[] = await invoke('read_file_into_cache', { filePath: selected})
      response = await invoke('process_data_chunks', {chunkSize : granularity * 4000})
      try {
        const processedData = response.map((value: number, index: number) => {
          return {
            name: `${((granularity / 1000) + index) - 1} ${granularity == 1000 ? 's' : 'ms'}`,
            value
          }
        })
        setData(processedData)

        setIsLoading(false)

      } catch (e) {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
      await message("No File Selected", "EMPTY SELECTED EXCEPTION")
    }
  }
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <html className="w-full h-full">
    <body>
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar 
        handleBrowse={handleBrowse}
        isLoading={isLoading}
        handleGranularityChange={handleGranularityChange}
        granularity={granularity}
        selectArray={granularityList}
        isReChunking={isReChunking}
      />
      <main className="w-full h-full p-4">
        <Button onClick={() => setSidebarOpen(!sidebarOpen)} size='sm'>
          {sidebarOpen ? 
          <span className="flex flex-row space-between">
          <svg className="w-6 h-6 text-white-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"/>
          </svg> 
          Close Sidebar 
          </span> : 
          <span className="flex flex-row space-between">
            <svg className="w-6 h-6 text-white-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"/>
            </svg>
            Open Sidebar
          </span>}
        </Button>
        <Home 
          data={data} 
          setIsLoading={setIsLoading}
          granularity={granularity}
          handleSlider={handleSlider}
          sliderValue={sliderValue}
        />
      </main>
    </SidebarProvider>
    </body>
    </html>
  );
}
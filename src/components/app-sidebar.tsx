"use client"
import { Calendar, Home, Inbox, Search, Settings, SidebarIcon } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Spinner } from "./ui/loader"
import { SelectValue,SelectTrigger, Select, SelectContent, SelectGroup, SelectLabel, SelectItem } from "./ui/select"

type SideBarProps = { 
        isLoading: boolean, 
        handleBrowse: Function,
        handleGranularityChange: Function,
        granularity: number,
        selectArray: {
            tag: string,
            multiplier: number
        }[],
        isReChunking: boolean
    }

export function AppSidebar({ isLoading, handleBrowse, handleGranularityChange, granularity, selectArray, isReChunking }: SideBarProps) {    
    return (
        <Sidebar variant="floating">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Armory Shield
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                        <SidebarMenuItem key={"Browse"}>
                                <SidebarMenuButton onClick={() => { !isLoading && handleBrowse() }} asChild>
                                    <h2>Browse <Spinner size="small" show={isLoading} /></h2>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem key={"Home"}>
                                {!isReChunking ? <Select onValueChange={(e) => handleGranularityChange(e)} value={granularity.toString()}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Granularity"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Time Granularity</SelectLabel>
                                            {selectArray.map((item, index) =>{
                                                return <SelectItem key={index} value={`${item.multiplier}`}>{item.tag}</SelectItem>
                                            })}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select> : <Spinner size='small'/>}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

import { useContext } from "react"
import React from "react"
import Context from '../provider/provider'
export const useAuth = () =>{
    return React.useContext(Context)
}
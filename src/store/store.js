import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../authSlice'
import problemReducer from "../problemSlice"
import themeReducer from "../themeSlice"
export const store = configureStore({
    reducer:{
        auth:authReducer,
         problem: problemReducer  ,
         theme:themeReducer 
    }
})
import {createSlice} from '@reduxjs/toolkit'

const doctorSlice = createSlice({
    name:'doctor',
    initialState:{
        doctor:null
    },
    reducers:{
        setDoctor:(state, action) => {
            state.doctor = action.payload
        }
    }
})

export const {setDoctor} = doctorSlice.actions
export default doctorSlice.reducer